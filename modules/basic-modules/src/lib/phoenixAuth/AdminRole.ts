export class AdminRole {
  private admin: boolean;
  setIsAdmin(is) {
    this.admin = is;
  }
  isAdmin() {
    return this.admin;
  }
}
