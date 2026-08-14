import fs from 'fs';
let code = fs.readFileSync('src/pages/student/StudentTestTake.tsx', 'utf8');

// The incorrect string added by the previous script:
const badEnding = `</div>
        </div>
      </div>
    </div>,
    document.body`;

const goodEnding = `</div>
      </div>
    </div>,
    document.body`;

// Let's replace ALL instances of badEnding with goodEnding
code = code.replace(new RegExp(badEnding.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), goodEnding);

// Then, manually add the 4th div back ONLY for the main component at the end of the file.
const endOfFileBad = `</motion.div>
        </div>
      </div>
    </div>,
    document.body
  )}</>;
}`;

const endOfFileGood = `</motion.div>
        </div>
        </div>
      </div>
    </div>,
    document.body
  )}</>;
}`;

code = code.replace(endOfFileBad, endOfFileGood);

fs.writeFileSync('src/pages/student/StudentTestTake.tsx', code);
console.log("Fixed JSX");
