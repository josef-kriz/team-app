import { Injectable } from '@angular/core'
import { db } from './database/db'
import { firstValueFrom, from, map, Observable, switchMap, tap, throwError } from 'rxjs'
import { Player, Round, RoundState, Scores, Table } from './game.model'
import { conditionalLiveQuery } from '../helpers/functions'
import { PlayerService } from './player.service'

@Injectable({
  providedIn: 'root',
})
export class GameService {
  constructor(private playerService: PlayerService) {}

  getLastRound(): Observable<Round | undefined> {
    return conditionalLiveQuery(() => db.rounds.reverse().first())
  }

  deleteAllRounds(): Observable<void> {
    return from(db.rounds.clear())
  }

  startRound(playersPerTeam: number = 2, tablesCount: number = 2): Observable<Round> {
    if (playersPerTeam < 0) return throwError(() => new Error('At least one player per team is needed to start a round'))

    if (tablesCount < 0) return throwError(() => new Error('At least one table is needed to start a round'))

    return from(
      db.transaction('rw', db.players, db.rounds, () =>
        firstValueFrom(
          this.getActiveRound().pipe(
            tap((activeRound) => {
              if (activeRound) throw new Error('Cannot start a new round while the previous one is still active')
            }),
            switchMap(() => this.playerService.getActivePlayers()),
            switchMap(async (players) => {
              if (players.length < 2) throw new Error('At least 2 players must be active to start a round.')

              const shuffledPlayers = this.shuffleArray(players)

              const tables: Table[] = Array.from({ length: tablesCount }, (_, i) => ({
                id: i,
                name: `Table #${i + 1}`,
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

              const whoPlayedWithWho = this.getWhoWasInATeamWithWhoHowManyTimes(players)

              this.assignPlayers(tables, shuffledPlayers, tablesCount, playersPerTeam)

              const roundsCount = await db.rounds.count()

              const round: Round = { name: `Round #${roundsCount + 1}`, tables, active: 1 }

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

              let playerA, playerATable: number, playerATeam: number, playerAIndex: number
              round.tables.some((table, i) =>
                table.teams.some((team, j) =>
                  team.players.some((player, k) => {
                    if (player.id === playerAId) {
                      playerA = player
                      playerATable = i
                      playerATeam = j
                      playerAIndex = k
                      return true
                    }
                    return false
                  })
                )
              )

              let playerB, playerBTable: number, playerBTeam: number, playerBIndex: number
              round.tables.some((table, i) =>
                table.teams.some((team, j) =>
                  team.players.some((player, k) => {
                    if (player.id === playerBId) {
                      playerB = player
                      playerBTable = i
                      playerBTeam = j
                      playerBIndex = k
                      return true
                    }
                    return false
                  })
                )
              )

              if (!playerA || !playerB) throw new Error('Cannot swap players, player(s) not found')
              ;[
                round.tables[playerATable!].teams[playerATeam!].players[playerAIndex!],
                round.tables[playerBTable!].teams[playerBTeam!].players[playerBIndex!],
              ] = [
                round.tables[playerBTable!].teams[playerBTeam!].players[playerBIndex!],
                round.tables[playerATable!].teams[playerATeam!].players[playerAIndex!],
              ]

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

  getRounds() {
    return conditionalLiveQuery(() => db.rounds.toArray())
  }

  getWhoWasInATeamWithWhoHowManyTimes(players: Player[]) {
    const playersAndWhoTheyHavePlayedWith: { [name1: string]: { [playedWith: string]: number } } = {}

    return this.getRounds().pipe(
      map((rounds) => {
        players.forEach((player) => {
          playersAndWhoTheyHavePlayedWith[player.name] = {}
        })

        players.forEach((player) => {
          players.forEach((teamMate) => {
            if (player.id !== teamMate.id) {
              playersAndWhoTheyHavePlayedWith[player.name][teamMate.name] = 0
            }
          })
        })

        rounds.forEach((round) => {
          round.tables.forEach((table) => {
            table.teams.forEach((team) => {
              team.players.forEach((player) => {
                team.players.forEach((teamMate) => {
                  if (teamMate.id !== player.id) {
                    playersAndWhoTheyHavePlayedWith[player.name][teamMate.name]++
                  }
                })
              })
            })
            const teamOne = table.teams[0]
            const teamTwo = table.teams[1]
            teamOne.players.forEach((member) => {
              teamTwo.players.forEach((rival) => {
                playersAndWhoTheyHavePlayedWith[member.name][rival.name] += 0.5
              })
            })
            teamTwo.players.forEach((member) => {
              teamOne.players.forEach((rival) => {
                playersAndWhoTheyHavePlayedWith[member.name][rival.name] += 0.5
              })
            })
          })
        })

        console.log(playersAndWhoTheyHavePlayedWith)
        return playersAndWhoTheyHavePlayedWith
      })
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

  private assignPlayers(tables: Table[], players: Player[], tablesCount: number, playersPerTeam: number): void {
    for (let i = 0, t = 0; i < players.length; i += 2, t++) {
      if (t === tablesCount) t = 0

      if (tables[t].teams[0].players.length === playersPerTeam) break

      // if this is the last player
      if (!players[i + 1]) {
        // if the last player would be the only one at the table
        if (tables[t].teams[0].players.length === 0) {
          tables.splice(t, 1)
          // if there is still room for a player at the previous table
          if (t > 1 && tables[t - 1].teams[1].players.length < playersPerTeam)
            tables[t - 1].teams[1].players.push(players[i])
        } else tables[t].teams[0].players.push(players[i])
        continue
      }

      tables[t].teams[0].players.push(players[i])
      tables[t].teams[1].players.push(players[i + 1])
    }
  }
}
