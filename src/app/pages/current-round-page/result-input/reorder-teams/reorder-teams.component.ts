import { Component, Inject } from '@angular/core'
import { Player, Round } from '../../../../game/game.model'
import { GameService } from '../../../../game/game.service'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'

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
    private gameService: GameService,
    @Inject(MAT_DIALOG_DATA) public round: Round,
    public dialogRef: MatDialogRef<ReorderTeamsComponent>
  ) {}

  selectedPlayer?: Player = undefined

  selectPlayer(justSelectedPlayer: Player) {
    if (!this.selectedPlayer) {
      this.selectedPlayer = justSelectedPlayer
    } else {
      if (!(justSelectedPlayer.id === this.selectedPlayer.id)) {
        this.gameService.swapPlayers(this.selectedPlayer.id!, justSelectedPlayer.id!).subscribe(() => {
          this.dialogRef.close('Players successfully swapped')
          console.log('success!')
        })
      }
      this.selectedPlayer = undefined
    }
  }
}
