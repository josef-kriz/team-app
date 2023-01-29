export interface Player {
  active: number
  id?: number
  name: string
}

export interface Round {
  active: number
  id?: number
  name: string
  tables: Table[]
}

export type Table = [Team, Team]

export interface Team {
  id?: number
  name: string
  players: Player[]
  score: number
}
