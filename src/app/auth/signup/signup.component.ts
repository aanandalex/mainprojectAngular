import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';

import { AuthService } from '../auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit, OnDestroy {
  isLoading = false;
  authStatusSub: Subscription;

  constructor(private authService: AuthService) { }

  onSignup(form: NgForm) {
    if(form.invalid || form.value.password !== form.value.confirmpassword) {
      return alert("Invalid Password should Match");
    }
    this.isLoading = true;
    this.authService.createUser(form.value.name, form.value.email, form.value.password);
  }

  ngOnInit() {
    this.authStatusSub = this.authService.getAuthStatusListener().subscribe(authStatus => {
      this.isLoading = false;
    });
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }

}
