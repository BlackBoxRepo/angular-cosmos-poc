import {Component} from '@angular/core';
import {Bip39} from '@cosmjs/crypto';
// import * as bip39 from "bip39";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'angular-cosmos-poc';
  wl: any;

  constructor() {
    console.log('bip39 is', Bip39)

    const enA = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16];
    console.log('len', enA.length);

    const allowedEntropyLengths = [16, 20, 24, 28, 32];
    console.log(allowedEntropyLengths.indexOf(enA.length));
    if (allowedEntropyLengths.indexOf(enA.length) === -1) {
      console.log('lameo', enA.length);
    }

    this.wl = Bip39.encode(new Uint8Array(enA))
  }

}
