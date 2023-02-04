import { Component } from '@angular/core'
import { NavigationStart, Router } from '@angular/router'
import { filter } from 'rxjs'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  constructor(private router: Router) {
    // @ts-ignore
    router.events.pipe(filter((event) => event instanceof NavigationStart)).subscribe((event: NavigationStart) => {
      this.activeLink = event.url
    })
  }
  title = 'team-app'

  links = [
    { address: '/current-round', title: 'Current Round' },
    { address: '/players', title: 'Players' },
    { address: '/stats', title: 'Stats' },
  ]
  activeLink = '/current-round'
}
