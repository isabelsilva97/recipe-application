export class User {
  constructor(public email: string | any, public id: string | any, private _token: string | any, private _tokenExpirationDate: Date) {

  }

  get token() {
    if (!this._tokenExpirationDate || new Date() > this._tokenExpirationDate) {
      return null;
    }
    return this._token;
  }
}