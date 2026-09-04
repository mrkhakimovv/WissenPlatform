const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminSATBuilder.tsx', 'utf-8');
code = code.replace(
`          </div>
        </div>
      ) : (`,
`          </div>
        </div>
        </div>
      ) : (`
);
fs.writeFileSync('src/pages/admin/AdminSATBuilder.tsx', code);
