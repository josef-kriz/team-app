import { Component } from '@angular/core'
import { NavigationStart, Router } from '@angular/router'
import { filter } from 'rxjs'
import {GameService} from "./game/game.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Round} from "./game/game.model";
import {ReorderTeamsComponent} from "./pages/current-round-page/result-input/reorder-teams/reorder-teams.component";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {

  constructor(private router: Router, private gameService: GameService, private _snackBar: MatSnackBar, public dialog: MatDialog) {
    // @ts-ignore
    router.events.pipe(filter((event) => event instanceof NavigationStart)).subscribe((event: NavigationStart) => {
      this.activeLink = event.url
    })
  }
  activeRound$ = this.gameService.getActiveRound()
  title = 'team-app'

  links = [
    { address: '/current-round', title: 'Current Round' },
    { address: '/players', title: 'Players' },
    { address: '/stats', title: 'Stats' },
  ]
  activeLink = '/current-round'

  deleteLastRound(): void {
    this.gameService.deleteLastRound().subscribe({
      next: () => {
        this._snackBar.open('Round deleted', undefined, {
          duration: 3000,
        })
      },
      error: (error) =>
        this._snackBar.open(error.message, undefined, {
          duration: 3000,
        }),
    })
  }

  deleteAllRounds(): void {
    this.gameService.deleteAllRounds().subscribe({
      next: () => {
        this._snackBar.open('Rounds deleted', undefined, {
          duration: 3000,
        })
      },
      error: (error) =>
        this._snackBar.open(error.message, undefined, {
          duration: 3000,
        }),
    })
  }

  openReorderTeamsModal(currentRound: Round) {
    const dialogRef = this.dialog.open(ReorderTeamsComponent, {
      data: currentRound,
    })

    dialogRef.afterClosed().subscribe((result) => {
      console.log('The dialog was closed')
      console.log(result)
    })
  }
}
