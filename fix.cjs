const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentTestTake.tsx', 'utf8');

const startStr = `        </div>
        </div>
        </div>
        </>
      )}
      </div>`;
const replacement = `        </div>
        </div>
        </>
      )}
      </div>`;

code = code.replace(startStr, replacement);
fs.writeFileSync('src/pages/student/StudentTestTake.tsx', code);
console.log('fixed');
