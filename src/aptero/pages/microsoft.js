import { microsoftService } from "../service/MicrosoftService";

async function main() {
  await microsoftService.start(() => {
    window.location.href = window.location.origin;
  });

  if (microsoftService.getUserAccount()) {
    //logged
    console.log("logged");
    setTimeout(() => {
      window.location.href = window.location.origin;
    }, 4000);
  } else {
    //notlogged
    console.log("passiveLogin");
    microsoftService.passiveLogin().then(() => {
      if (microsoftService.getUserAccount()) {
        //logged
        console.log("logged");
        setTimeout(() => {
          window.location.href = window.location.origin;
        }, 4000);
      } else {
        console.log("loginWithRedirectInternal");
        microsoftService.loginWithRedirectInternal();
      }
    });
  }
}
main();