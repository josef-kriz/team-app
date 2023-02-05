import { Injectable } from '@angular/core'
import { db } from './database/db'
import { firstValueFrom, from, map, Observable, switchMap, tap, throwError } from 'rxjs'
import { Player, Round, RoundState, Scores, Table } from './game.model'
import { conditionalLiveQuery } from '../helpers/functions'

@Injectable({
  providedIn: 'root',
})
export class GameService {
  constructor() {}

  getPlayers(): Observable<Player[]> {
    return conditionalLiveQuery(() => db.players.orderBy('name').toArray())
  }

  getActivePlayers(): Observable<Player[]> {
    return this.getPlayers().pipe(map((players) => players.filter((player) => player.active)))
  }

  toggleActiveOnPlayer(player: Player): Observable<number> {
    player.active = player.active === 1 ? 0 : 1
    return this.updatePlayer(player)
  }

  addPlayer(name: string): Observable<number> {
    const trimmedName = name.trim()

    return from(
      db.transaction('rw', db.players, async () => {
        const existingPlayer = await db.players.where('name').equalsIgnoreCase(trimmedName).first()

        if (existingPlayer) throw new Error('A player with this name already exists')

        return db.players.add({ active: 1, name: trimmedName })
      })
    )
  }

  updatePlayer(player: Player): Observable<number> {
    return from(db.players.update(player, player))
  }

  deletePlayer(id: number): Observable<void> {
    return from(db.players.delete(id))
  }

  deleteAllRounds(): Observable<void> {
    return from(db.rounds.clear())
  }

  getLastRound(): Observable<Round | undefined> {
    return conditionalLiveQuery(() => db.rounds.toCollection().last())
  }

  startRound(playersPerTeam: number = 2, tablesCount: number = 2): Observable<Round> {
    return from(
      db.transaction('rw', db.players, db.rounds, () =>
        firstValueFrom(
          this.getActiveRound().pipe(
            tap((activeRound) => {
              if (activeRound) throw new Error('Cannot start a new round while the previous one is still active')
            }),
            switchMap(() => this.getActivePlayers()),
            switchMap(async (players) => {
              if (players.length < 1) throw new Error('At least one player has to be active.')

              const shuffledPlayers = this.shuffleArray(players)

              const tables: Table[] = Array.from({ length: tablesCount }, (_, i) => ({
                id: i,
                teams: [
                  {
                    name: `Team ${i + 1}-A`,
                    id: `${i + 1}a`,
                    players: [],
                    score: 0,
                  },
                  {
                    id: `${i + 1}b`,
                    name: `Team ${i + 1}-B`,
                    players: [],
                    score: 0,
                  },
                ],
              }))

              for (let i = 0, t = 0; i < shuffledPlayers.length; i += 2, t++) {
                if (t === tablesCount) t = 0

                tables[t].teams[0].players.push(shuffledPlayers[i])

                if (shuffledPlayers[i + 1]) tables[t].teams[1].players.push(shuffledPlayers[i + 1])
              }

              const round: Round = { name: 'Round #1', tables, active: 1 }

              await db.rounds.add(round)

              return round
            })
          )
        )
      )
    )
  }

  getActiveRound(): Observable<Round | undefined> {
    return conditionalLiveQuery(() => db.rounds.where('active').equals(RoundState.started).first())
  }

  swapPlayers(playerAId: number, playerBId: number): Observable<any> {
    return from(
      db.transaction('rw', db.rounds, () =>
        firstValueFrom(
          this.getActiveRound().pipe(
            switchMap((round) => {
              if (!round) throw new Error('Cannot swap players, there is no active round')

              let playerA
              for (const table of round.tables) {
                for (const team of table.teams) {
                  playerA = team.players.find((player) => player.id === playerAId)
                  if (playerA) break
                }
                if (playerA) break
              }
              console.log(playerA?.name, round.tables[0].teams[0].players[0].name)

              let playerB
              for (const table of round.tables) {
                for (const team of table.teams) {
                  playerB = team.players.find((player) => player.id === playerBId)
                  if (playerB) break
                }
                if (playerB) break
              }

              if (!playerA || !playerB) throw new Error('Cannot swap players, player(s) not found')

              let tmp = playerA
              playerA = playerB
              playerB = tmp
              // ;[playerA, playerB] = [playerB, playerA]
              console.log(playerA.name, round.tables[0].teams[0].players[0].name) // TODO
              console.log(round)

              return from(db.rounds.update(round, round))
            })
          )
        )
      )
    )
  }

  setResults(tableId: number, teamAScore: number, teamBScore: number): Observable<any> {
    return from(
      db.transaction('rw', db.rounds, () =>
        firstValueFrom(
          this.getActiveRound().pipe(
            switchMap((round) => {
              if (!round) throw new Error('Cannot set results, there is no active round')

              const table = round.tables.find((t) => t.id === tableId)

              if (!table) throw new Error(`A table with ID ${tableId} doesn't exist`)

              table.teams[0].score = teamAScore
              table.teams[1].score = teamBScore

              return from(db.rounds.update(round, round))
            })
          )
        )
      )
    )
  }

  endRound(): Observable<any> {
    return from(
      db.transaction('rw', db.rounds, () =>
        firstValueFrom(
          this.getActiveRound().pipe(
            switchMap(async (round) => {
              if (!round) return throwError(() => new Error('No active round to end'))

              const scores = round.tables.reduce((acc, table) => {
                table.teams[0].players.forEach((player) =>
                  table.teams[1].players.forEach((opponent) => {
                    if (!acc[player.id!]) acc[player.id!] = {}
                    acc[player.id!][opponent.id!] = {
                      score: table.teams[0].score - table.teams[1].score,
                      wins: table.teams[0].score - table.teams[1].score > 0 ? 1 : 0,
                    }
                  })
                )

                table.teams[1].players.forEach((player) =>
                  table.teams[0].players.forEach((opponent) => {
                    if (!acc[player.id!]) acc[player.id!] = {}
                    acc[player.id!][opponent.id!] = {
                      score: table.teams[1].score - table.teams[0].score,
                      wins: table.teams[1].score - table.teams[0].score > 0 ? 1 : 0,
                    }
                  })
                )

                return acc
              }, {} as Scores)

              await db.rounds.update(round, { ...round, active: RoundState.finished, scores })

              return
            })
          )
        )
      )
    )
  }

  private shuffleArray(players: Player[]): Player[] {
    let currentIndex = players.length,
      temporaryValue,
      randomIndex

    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex)
      currentIndex -= 1

      temporaryValue = players[currentIndex]
      players[currentIndex] = players[randomIndex]
      players[randomIndex] = temporaryValue
    }

    return players
  }
}
