import { Component } from '@angular/core'
import { NavigationStart, Router } from '@angular/router'
import { filter, map } from 'rxjs'
import { GameService } from './game/game.service'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Round } from './game/game.model'
import { ReorderTeamsComponent } from './pages/current-round-page/result-input/reorder-teams/reorder-teams.component'
import { MatDialog } from '@angular/material/dialog'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  activeRound$ = this.gameService.getActiveRound()
  title = 'team-app'

  links: { address: string; title: string }[] = []
  activeLink = '/players'

  constructor(
    private router: Router,
    private gameService: GameService,
    private _snackBar: MatSnackBar,
    public dialog: MatDialog
  ) {
    // @ts-ignore
    router.events.pipe(filter((event) => event instanceof NavigationStart)).subscribe((event: NavigationStart) => {
      this.activeLink = event.url
    })

    this.gameService
      .getInactiveRounds()
      .pipe(map((inactiveRound) => !!inactiveRound))
      .subscribe((inactiveRoundsExist) => {
        this.setMenuOptions(inactiveRoundsExist)
      })
  }

  deleteLastRound(): void {
    if (confirm('Are you sure to delete the last round?')) {
      this.gameService.deleteActiveRound().subscribe({
        next: () => {
          this._snackBar.open('Round deleted', undefined, {
            duration: 3000,
            verticalPosition: 'top',
          })
        },
        error: (error) =>
          this._snackBar.open(error.message, undefined, {
            duration: 3000,
          }),
      })
    }
  }

  deleteAllRounds(): void {
    if (confirm('Are you sure to delete all rounds?')) {
      this.gameService.deleteAllRounds().subscribe({
        next: () => {
          this._snackBar.open('Rounds deleted', undefined, {
            duration: 3000,
            verticalPosition: 'top',
          })
        },
        error: (error) =>
          this._snackBar.open(error.message, undefined, {
            duration: 3000,
            verticalPosition: 'top',
          }),
      })
    }
  }

  openReorderTeamsModal(currentRound: Round) {
    const dialogRef = this.dialog.open(ReorderTeamsComponent, {
      data: currentRound,
    })

    dialogRef.afterClosed().subscribe(() => {})
  }

  private setMenuOptions(statsVisible: boolean) {
    this.links = [
      { address: '/current-round', title: 'Current Round' },
      { address: '/players', title: 'Players' },
    ]
    if (statsVisible) {
      this.links.push({ address: '/stats', title: 'Stats' })
    }
  }
}
