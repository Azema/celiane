const https = require('https');
const references = {};
const addRef = (newRef) => {
  newRef = newRef.replace(/\s/g, "");
  if (!references.hasOwnProperty(newRef)) {
    references[newRef] = {};
  }
}
const getDataFromRef = async (ref) => {
  const url = `https://www.legrand.fr/services/suggest?s=${ref}&fail=false`;
  return new Promise((resolve, rej) => {
    https.get(url, (res) => {
      let body = "";
  
      res.on("data", (chunk) => {
        body += chunk;
      });
  
      res.on("end", () => {
        try {
          let json = JSON.parse(body);
          resolve(json);
        } catch (error) {
          console.error(error.message);
          rej(error.message);
        };
      });
    }).on("error", (error) => {
      rej(error.message);
      console.error(error.message);
    });
  });
}
function waitTime (waitTime) {

  return new Promise ((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, waitTime);
  });
  
}

async function main() {
  const compositions = require('../js/celiane.json');
  
  /**
   * On récupère toutes les références qui se trouvent dans le fichier des compositions
   */
  compositions.forEach((c, i) => {
    if (c.elements?.mecanisme?.ref) {
      if (Array.isArray(c.elements.mecanisme.ref)) {
        c.elements.mecanisme.ref.forEach((ref) => {
          addRef(ref);
        });
      } else {
        addRef(c.elements.mecanisme.ref);
      }
    }
    if (c.elements?.enjoliveur?.ref) {
      addRef(c.elements.enjoliveur.ref);
    } 
    if (c.elements?.enjoliveur?.couleurs) {
      const colors = Object.keys(c.elements.enjoliveur.couleurs);
      colors.forEach((color) => {
        if (Array.isArray(c.elements.enjoliveur.couleurs[color])) {
          c.elements.enjoliveur.couleurs[color].forEach((ref) => {
            addRef(ref);
          });
        } else {
          addRef(c.elements.enjoliveur.couleurs[color]);
        }
      })
    }
    if (c.elements?.voyant?.ref) {
      addRef(c.elements.voyant.ref);
    }
    if (c.elements?.options?.ref) {
      addRef(c.elements.options.ref);
    }
  });
  // On ajoute les supports
  addRef("080251");
  addRef("080252");
  addRef("080253");
  addRef("080254");
  
  const nbRefs = Object.keys(references);
  console.log('Le fichier contient %d références', nbRefs.length);
  
  /**
   * On recherche les informations liées aux références
   */
  for (let r = 0, _len = nbRefs.length; r < _len; r++) {
    const ref = nbRefs[r];
    const resultJson = await getDataFromRef(ref);
    if (resultJson) {
      // console.log('Result JSON', resultJson);
      if (resultJson?.datas?.suggestPro?.elements && resultJson?.datas?.suggestPro?.elements.length > 0) {
        resultJson.datas.suggestPro.elements.forEach((e) => {
          if (e.r == ref) {
            references[ref] = {
              label: e.label,
              href: e.href
            };
            // console.log('Ref found (ref: %s)', ref);
            return false;
          }
        })
      } else {
        console.log('/!\\ Ref non trouvée: ', ref);
      }
    }
    await waitTime(1000);
  }

  /**
   * On écrit tout ça dans le fichier des composants
   */
  const fs = require('node:fs');
  const content = JSON.stringify(references);
  try {
    fs.writeFileSync('./composants.json', content);
    console.log('Le fichier composants a été écrit avec succès');
  } catch (err) {
    console.error(err);
  }

}
main();