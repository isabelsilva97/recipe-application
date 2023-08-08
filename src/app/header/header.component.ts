import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { DataStorageService } from '../shared/data-storage.service';
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Output() featureSelected = new EventEmitter<string>();
  isAuthenticated: boolean = false;
  private userSub: Subscription | any;

  constructor(private dataStorageService: DataStorageService, private autService: AuthService) { }

  ngOnInit() {
    this.userSub = this.autService.user.subscribe(user => {
      this.isAuthenticated = !user.email ? false : true;
    });
  }

  onSelect(feature: string) {
    this.featureSelected.emit(feature);
  }

  onSaveData() {
    this.dataStorageService.storeRecipes();
  }

  onFetchData() {
    this.dataStorageService.fetchRecipes().subscribe();
  }

  onLogout() {
    this.autService.logout();
  }

  ngOnDestroy() {
    this.userSub.unsubscribe();
  }
}
