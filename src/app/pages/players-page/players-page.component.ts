import { Component } from '@angular/core'
import { map, Observable } from 'rxjs'
import { Player } from '../../game/game.model'
import { MatSnackBar } from '@angular/material/snack-bar'
import { PlayerService } from '../../game/player.service'

@Component({
  selector: 'app-players-page',
  templateUrl: './players-page.component.html',
  styleUrls: ['./players-page.component.css'],
})
export class PlayersPageComponent {
  readonly activePlayers$: Observable<Player[]>
  readonly inactivePlayers$: Observable<Player[]>

  constructor(private _snackBar: MatSnackBar, private playerService: PlayerService) {
    this.activePlayers$ = this.playerService.getPlayers().pipe(map((player) => player.filter((p) => !!p.active)))
    this.inactivePlayers$ = this.playerService.getPlayers().pipe(map((player) => player.filter((p) => !p.active)))
  }

  trackById(_: number, player: Player): number {
    return player.id!
  }

  toggleActiveness(player: Player) {
    this.playerService.toggleActiveOnPlayer(player)
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
