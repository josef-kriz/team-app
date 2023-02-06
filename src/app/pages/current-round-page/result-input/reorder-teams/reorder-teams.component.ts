import { Component, Inject } from '@angular/core'
import { Player, Round } from '../../../../game/game.model'
import { GameService } from '../../../../game/game.service'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'

export type DialogData = {
  round: Round
}

@Component({
  selector: 'app-reorder-teams',
  templateUrl: './reorder-teams.component.html',
  styleUrls: ['./reorder-teams.component.css'],
})
export class ReorderTeamsComponent {
  constructor(
    private _snackBar: MatSnackBar,
    private gameService: GameService,
    @Inject(MAT_DIALOG_DATA) public round: Round,
    public dialogRef: MatDialogRef<ReorderTeamsComponent>
  ) {}

  selectedPlayer?: Player = undefined

  selectPlayer(justSelectedPlayer: Player) {
    if (!this.selectedPlayer) {
      this.selectedPlayer = justSelectedPlayer
    } else {
      const selectedPlayer = this.selectedPlayer
      if (!(justSelectedPlayer.id === this.selectedPlayer.id)) {
        this.gameService.swapPlayers(this.selectedPlayer.id!, justSelectedPlayer.id!).subscribe({
          next: () => {
            this._snackBar.open(`Swapped ${selectedPlayer.name} with ${justSelectedPlayer.name}`, undefined, {
              duration: 3000,
            })
          },
          error: (error) =>
            this._snackBar.open(error.message, undefined, {
              duration: 3000,
            }),
          complete: () => this.dialogRef.close()
        })
      }
      this.selectedPlayer = undefined
    }
  }
}
