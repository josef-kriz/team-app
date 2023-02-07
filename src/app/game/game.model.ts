export interface Player {
  active: number
  id?: number
  name: string
}

export enum RoundState {
  'finished' = 0,
  'started' = 1,
}

export interface Round {
  active: RoundState
  id?: number
  name: string
  tables: Table[]
  scores?: Scores
}

export interface Table {
  id: number
  teams: [Team, Team]
}

export interface Team {
  id: string
  name: string
  players: Player[]
  score: number
}

export type Scores = { [key: number]: { [key: number]: PlayerScore } }

export interface PlayerScore {
  score: number
  wins: number
}

export interface PlayerStats extends PlayerScore {
  player: Player
  relativeScore: number
}
