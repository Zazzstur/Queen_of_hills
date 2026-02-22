I have resolved the error `stayService.getStays is not a function`.

The issue was that `stayService.js` was missing the `getStays` method wrapper, even though `mockDb.js` had the underlying implementation. I have added the missing method to `stayService.js`.

The stays listing page should now load correctly without crashing.
