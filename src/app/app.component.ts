import {Component, OnInit} from '@angular/core';
import {Bip39, EnglishMnemonic} from '@cosmjs/crypto';
import {Account, GasPrice, SigningStargateClient, StargateClient} from '@cosmjs/stargate';
import {filter, from, map, mergeMap, Observable, take} from 'rxjs';
import {AccountData, coins, DirectSecp256k1HdWallet} from '@cosmjs/proto-signing';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'angular-cosmos-poc';
  wl: EnglishMnemonic;

  stargateClient!: SigningStargateClient;

  wallet!: DirectSecp256k1HdWallet;

  constructor() {
    console.log('bip39 is', Bip39)

    const enA: number[] = [];
    for (let i = 0; i < 24; i++) {
      enA[i] = Math.floor(Math.random() * 10000000);
    }

    console.log('len', enA);

    const allowedEntropyLengths = [16, 20, 24, 28, 32];
    console.log(allowedEntropyLengths.indexOf(enA.length));
    if (allowedEntropyLengths.indexOf(enA.length) === -1) {
      console.log('lameo', enA.length);
    }

    this.wl = Bip39.encode(new Uint8Array(enA))
  }

  ngOnInit(): void {
    // this.connect();
  }

  getAccount(): void {
    this.getFirstAccount()
      .subscribe(
        {
          next: (account) => console.log('got account', account),
          error: err => console.log('failed to get account', err)
        }
      );
  }

  private getFirstAccount(): Observable<Account | null> {
    return from(this.wallet.getAccounts())
      .pipe(
        filter((accounts) => accounts.length > 0),
        map(accounts => accounts[0]),
        mergeMap((account: AccountData) => from(this.stargateClient.getAccount(account.address)))
      )
  }

  getAllBalances(): void {
    this.getFirstAccount()
      .pipe(
        mergeMap(account => from(this.stargateClient.getAllBalances(account?.address || '')))
      )
      .subscribe(
        {
          next: (balances) => console.log('got balances', balances),
          error: err => console.log('failed to get balances', err)
        }
      );
  }

  createWallet(): void {
    // console.log('mnemonic is', this.wl)
    // DirectSecp256k1HdWallet.fromMnemonic(this.wl.toString(), {prefix: 'smpl'})
    //   .then(w => {
    //     console.log('wallet', w)
    //     this.wallet = w;
    //   })

    DirectSecp256k1HdWallet.generate(18, {prefix: 'smpl'})
      .then(
        async (w) => {
          console.log('generated wallet', w, w)
          const [account] = await w.getAccounts();
          console.log('generated account', account.address)
          this.wallet = w
        }
      )
  }

  connect(): void {
    from(
      SigningStargateClient.connectWithSigner(
        'http://testnet-validator1.smplfinance.com:26657',
        this.wallet,
        {prefix: 'smpl', gasPrice: GasPrice.fromString('0smpl')}
      )
    )
      .subscribe({
          next: (client) => {
            console.log('got client', client)
            this.stargateClient = client
          },
          error: error => {
            console.log('connection failed', error)
          },
          complete: () => console.log('connect complete')
        }
      );
  }

  sendToken(): void {
    this.getFirstAccount()
      .pipe(
        filter(account => !!account),
        mergeMap((account) => from(
            this.stargateClient.sendTokens(
              account?.address || '',
              'smpl192n546u29ltwp43l03ugm3ujdh09hn5tgdyth3',
              coins(100, 'smpl'),
              'auto',
              "coolio"
            )
          )
        )
      )
      .subscribe(
        status => {
          console.log('send coin response', status)
        }
      );
  }
}
