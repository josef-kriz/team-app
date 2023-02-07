import { Injectable } from '@angular/core';
import { from, map, Observable } from 'rxjs'
import { Player } from './game.model'
import { conditionalLiveQuery } from '../helpers/functions'
import { db } from './database/db'

@Injectable({
  providedIn: 'root'
})
export class PlayerService {

  constructor() { }

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
}
