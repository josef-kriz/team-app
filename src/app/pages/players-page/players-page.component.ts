import { Component } from '@angular/core'
import { map, Observable } from 'rxjs'
import { Player } from '../../game/game.model'
import { MatSnackBar } from '@angular/material/snack-bar'
import { PlayerService } from '../../game/player.service'
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop'

@Component({
  selector: 'app-players-page',
  templateUrl: './players-page.component.html',
  styleUrls: ['./players-page.component.css'],
})
export class PlayersPageComponent {
  readonly players$: Observable<{ active: Player[]; inactive: Player[] }>

  constructor(private _snackBar: MatSnackBar, private playerService: PlayerService) {
    this.players$ = this.playerService.getPlayers().pipe(
      map((players) => ({
        active: players.filter((p) => !!p.active),
        inactive: players.filter((p) => !p.active),
      }))
    )
  }

  trackById(_: number, player: Player): number {
    return player.id!
  }

  drop(event: CdkDragDrop<Player[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex)
    } else {
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex)
      this.playerService.toggleActiveOnPlayer(event.container.data[event.currentIndex])
    }
  }

  addPlayer(nameField: HTMLInputElement): void {
    this.playerService.addPlayer(nameField.value).subscribe({
      next: () => {
        nameField.value = ''
        this._snackBar.open('Player added', undefined, {
          duration: 3000,
        })
      },
      error: (error) =>
        this._snackBar.open(error.message, undefined, {
          duration: 3000,
        }),
    })
  }

  deletePlayer(player: Player): void {
    this.playerService.deletePlayer(player.id!).subscribe({
      next: () => {
        this._snackBar.open('Player deleted', undefined, {
          duration: 3000,
        })
      },
      error: (error) =>
        this._snackBar.open(error.message, undefined, {
          duration: 3000,
        }),
    })
  }
}
