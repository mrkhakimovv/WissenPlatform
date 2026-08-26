const fs = require('fs');
let code = fs.readFileSync('src/components/PullToRefresh.tsx', 'utf8');

code = code.replace(`      // prevent default if we want to stop normal scrolling while pulling
      if (e.cancelable) {
        e.preventDefault();
      }`, '');

fs.writeFileSync('src/components/PullToRefresh.tsx', code);
