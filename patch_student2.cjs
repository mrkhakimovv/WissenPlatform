const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentNews.tsx', 'utf8');

code = code.replace(`                      </button>
                    </div>
                  </div>

                </div>`, `                      </button>
                    </div>
                  </div>
                  )}
                </div>`);

fs.writeFileSync('src/pages/student/StudentNews.tsx', code);
