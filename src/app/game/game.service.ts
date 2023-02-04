import { Injectable } from '@angular/core'
import { db } from './database/db'
import { first, firstValueFrom, from, map, Observable, switchMap, tap } from 'rxjs'
import { liveQuery } from 'dexie'
import { Player, Round, Table } from './game.model'

@Injectable({
  providedIn: 'root',
})
export class GameService {
  constructor() {}

  getPlayers(): Observable<Player[]> {
    return from(liveQuery(() => db.players.orderBy('name').toArray()))
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

  startRound(playersPerTeam: number = 2, tablesCount: number = 2): Observable<Round> {
    return from(
      db.transaction('rw', db.players, db.rounds, () =>
        firstValueFrom(
          this.getActivePlayers().pipe(
            first(),
            tap(a => console.log(a)),
            switchMap(async (players) => {
              if(players.length < 1) throw new Error('At least one player has to be active.')
              
              const shuffledPlayers = this.shuffleArray(players)

              const tables: Table[] = Array.from({ length: tablesCount }, (_, i) => [
                {
                  name: `Team ${i + 1}-A`,
                  players: [],
                  score: 0,
                },
                {
                  name: `Team ${i + 1}-B`,
                  players: [],
                  score: 0,
                },
              ])

              for (let i = 0, t = 0; i < shuffledPlayers.length; i += 2, t++) {
                if (t === tablesCount) t = 0

                tables[t][0].players.push(shuffledPlayers[i])

                if (shuffledPlayers[i + 1]) tables[t][1].players.push(shuffledPlayers[i + 1])
              }

              const round: Round = { name: 'Round #1', tables, active: 1 }
              
              await db.rounds.add(round)

              return round
            }),
            tap(a => console.log(a))
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
