import Dexie, { Table } from 'dexie'
import { Player, Round } from '../game.model'

export class AppDB extends Dexie {
  players!: Table<Player, number>
  rounds!: Table<Round, number>

  constructor() {
    super('team-app-db')

    this.version(3).stores({
      players: '++id, name',
      rounds: '++id, active',
    })
  }
}

export const db = new AppDB()
