import {Component, Inject, OnInit} from '@angular/core'
import { Player, Round } from '../../../../game/game.model'
import { GameService } from '../../../../game/game.service'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { PlayerService } from '../../../../game/player.service'
import { Subscription } from 'rxjs'

@Component({
  selector: 'app-reorder-teams',
  templateUrl: './reorder-teams.component.html',
  styleUrls: ['./reorder-teams.component.css'],
})
export class ReorderTeamsComponent implements OnInit{
  constructor(
    private _snackBar: MatSnackBar,
    private gameService: GameService,
    private playerService: PlayerService,
    @Inject(MAT_DIALOG_DATA) public round: Round,
    public dialogRef: MatDialogRef<ReorderTeamsComponent>
  ) {}

  selectedPlayer?: Player = undefined
  activePlayersThatAreNotInCurrentRound: Player[] = []
  subscriptions: Subscription[] = []
  
  ngOnInit() {
    this.getActivePlayersThatAreNotPlaying()
  }
  
  getActivePlayersThatAreNotPlaying() {
    this.subscriptions.push(
      this.playerService.getActivePlayers().subscribe((players) => {
        this.activePlayersThatAreNotInCurrentRound = players.filter((activePlayer) => {
          const allPlayersThatAreInATeam: Player[] = []
          this.round.tables.forEach((table) => {
            table.teams.forEach((team) => {
              team.players.forEach((player) => {
                allPlayersThatAreInATeam.push(player)
              })
            })
          })
          const currentPlayerIsInAGame = !!allPlayersThatAreInATeam.find(
            (playerInGame) => playerInGame.id === activePlayer.id
          )
          return !currentPlayerIsInAGame
        })
      })
    )
  }

  selectPlayer(justSelectedPlayer: Player) {
    if (!this.selectedPlayer) {
      this.selectedPlayer = justSelectedPlayer
    } else {
      const selectedPlayer = this.selectedPlayer
      if (!(justSelectedPlayer.id === this.selectedPlayer.id)) {
        this.gameService.swapPlayers(this.selectedPlayer.id!, justSelectedPlayer.id!).subscribe({
          next: () =>
            this._snackBar.open(`Swapped ${selectedPlayer.name} with ${justSelectedPlayer.name}`, undefined, {
              duration: 3000,
              verticalPosition: 'top',
            }),
          error: (error) =>
            this._snackBar.open(error.message, undefined, {
              duration: 3000,
              verticalPosition: 'top',
            }),
          complete: () => this.dialogRef.close(),
        })
      }
      this.selectedPlayer = undefined
    }
  }
}
