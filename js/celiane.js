async function printJSON(file) {
  const response = await fetch(file);
  return await response.json();
}

$(async function() {
  const compositions = await printJSON('/celiane/js/celiane.json');
  const composants = await printJSON('/celiane/js/composants.json');
  const commande = {};
  const supports = {1: 0, 2: 0, 3: 0, 4: 0, total: 0};
  const optionsPostes = [];
  const template = $('script[data-template="rowPoste"]').text();
  const supportUni = $('#support-uni'),
        supportDbl = $('#support-dbl'),
        supportTpl = $('#support-tpl'),
        supportQdl = $('#support-qdl'),
        editSupports = $('.editSupports'),
        $chantier = $('#chantier'),
        $defaultColor = $('#defaultColor');

  const debug = false;
  $('#result').hide();
  $('.export').hide();

  /**
   * Permet de créer les groupes et les options de sélection des postes
   */
  function createOptions() {
    const groupes = {};
    compositions.forEach((e, i) => {
      if (!groupes.hasOwnProperty(e.categorie)) {
        groupes[e.categorie] = [];
      }
      groupes[e.categorie].push(`<option value="${e.id}">${e.name}</option>`);
      // optionsPostes.push();
    });
    Object.keys(groupes).forEach((g, i) => {
      let groupe = `<optgroup label="${g}">`;
      groupes[g].forEach((o, i) => {
        groupe += o;
      });
      groupe += '</optgroup>';
      optionsPostes.push(groupe);
    });
  }
  createOptions();

  const findCompoFromId = (id) => {
    for (let c = 0, _len = compositions.length; c < _len; c++) {
      if (compositions[c].id == id) return compositions[c];
    }
    return null;
  }

  const calculSupportsUni = () => {
    let total = supports.total;
    total = total - supports[4] * 4;
    total = total - supports[3] * 3;
    total = total - supports[2] * 2;
    return total;
  }
  const calculSupportsTotal = () => {
    let total = 0;
    for(let i=1; i < 5;i++) supports[i] = 0;
    $('.poste').each(function() {
      const qty = parseInt($(this).find('.qty').val(), 10);
      const support = this.dataset.support;
      if (support > 0) supports[support] += qty;
      total += support * qty;
    })
    supports.total = total;
  }
  const displaySupports = (force = false) => {
    if (!force) calculSupportsTotal();
    supportUni.val(supports[1]);
    supportDbl.val(supports[2]);
    supportTpl.val(supports[3]);
    supportQdl.val(supports[4]);
  }

  const initPoste = () => {
    const parent = $('.poste.new');
    const select = $('.selectPoste', parent);
    const qty = $('.qty', parent);
    const del = $('.del', parent);
    let compo;
    optionsPostes.forEach((e) => {
      select.append(e);
    });
    select.on('change', function(ev) {
      ev.stopPropagation();
      ev.preventDefault();
      $('div.option', parent).remove();
      const defaultColor = $('option:selected', $defaultColor).val();
      const val = this.value;
      const color = $('.selectColor', parent);
      compo = findCompoFromId(val);
      parent.get(0).dataset.compo = val;
      parent.get(0).dataset.support = compo.elements.support;
      if (debug) console.log('Support du poste: ', compo.elements.support, supports[compo.elements.support]);
      // if (compo.elements.support > 0) supports[compo.elements.support]++;
      displaySupports();
      if (compo.elements.enjoliveur.hasOwnProperty('couleurs')) {
        color.empty();
        if (debug) console.log('select change', {defaultColor, val, compo, color, supports, parent, compositions});
        const colors = Object.keys(compo.elements.enjoliveur.couleurs);
        if (debug) console.log('Couleurs', colors);
        color.append('<option value="" selected>Select Couleur</option>');
        colors.forEach((e) => {
          let selected = '';
          if (defaultColor && defaultColor == e) { selected = 'selected'; }
          color.append(`<option value="${e}"${selected}>${e}</option>`);
        });
      } else {
        color.empty();
        color.hide();
      }
      
      if (compo.elements.hasOwnProperty('options')) {
        if (debug) console.log('options', compo.elements.options);
        $('.action', parent).before(`<div class="col-md-1 col-sm-2 option" title="${compo.elements.options.name}" data-toggle="tooltip" data-placement="top">
              <label class="form-check-label">Option <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-info-circle-fill" viewBox="0 0 16 16">
  <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2"/>
</svg></label>
              <input class="form-check-input option" type="checkbox" value="">
            </div>`);
        $('[data-toggle="tooltip"]').tooltip()
      }
      if (compo.elements?.voyant?.option) {
        if (debug) console.log('voyant option', compo.elements.voyant);
        $('.action', parent).before(`<div class="col-md-1 col-sm-2 option" title="Ajouter le voyant en option" data-toggle="tooltip" data-placement="top">
          <label class="form-check-label">Option <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-info-circle-fill" viewBox="0 0 16 16">
  <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2"/>
</svg></label>
          <input class="form-check-input option" type="checkbox" value="">
        </div>`);
        $('[data-toggle="tooltip"]').tooltip()
      }
      $('.element .invalid-feedback', parent).hide();
    });
    qty.on('change', function(ev) {
      if (debug) console.log('Qty change');
      if (compo && compo.elements.support == 0) return;
      supports[1] = 0; supports[2] = 0; supports[3] = 0; supports[4] = 0;
      $('.qty').each((i, e) => {
        const par = $(e).parents('.poste').first();
        const support = parseInt(par.get(0).dataset.support, 10);
        // if (debug) console.log('support', support);
        if (support > 0) supports[support] += parseInt($(e).val(), 10);
      });
      displaySupports();
    });
    del.on('click', (ev) => {
      const support = parent.get(0).dataset.support;
      const qty = parseInt($('.qty', parent).val(), 10);
      if (support > 0) supports[support] -= qty;
      if (debug) console.log('Del row', {parent, support, qty});
      parent.remove();
      displaySupports();
    });
    $('.selectColor', parent).on('change', () => {
      $('.color .invalid-feedback', parent).hide();
    })
    select.focus();
  }

  /*
   *  Supports
   */
  const showInvalidSupport = () => {
    $( ".supports .invalid-feedback" ).fadeIn(400).delay( 2000 ).slideUp( 300 );
  }
  const activeSupportsEvent = () => {
    calculSupportsTotal();
    supportUni.on('change', function(ev) {
      // const qty = parseInt($(this).val(), 10);
      // supports[1] = calculSupportsUni();
    });
    supportDbl.on('change', function(ev) {
      const qty = parseInt($(this).val(), 10),
            total = qty * 2,
            remaining = supports.total - ((supports[4] * 4) + (supports[3] * 3));
      if (debug) console.log('supportDbl', {uni: supports[1], qty});
      if (total > remaining) {
        supportDbl.val(supports[2]);
        showInvalidSupport();
        return false;
      }
      supports[2] = qty;
      supports[1] = calculSupportsUni();
      supportUni.val(supports[1]);
    });
    supportTpl.on('change', function(ev) {
      const qty = parseInt($(this).val(), 10),
            total = qty * 3,
            remaining = supports.total - ((supports[4] * 4) + (supports[2] * 2));
      if (debug) console.log('supportTpl', {uni: supports[1], qty});
      if (total > remaining) {
        supportTpl.val(supports[3]);
        showInvalidSupport();
        return false;
      }
      supports[3] = qty;
      supports[1] = calculSupportsUni();
      supportUni.val(supports[1]);
    });
    supportQdl.on('change', function(ev) {
      const qty = parseInt($(this).val(), 10),
            total = qty * 4,
            remaining = supports.total - ((supports[2] * 2) + (supports[3] * 3));
      if (debug) console.log('supportQdl', {uni: supports[1], qty});
      if (total > remaining) {
        supportQdl.val(supports[4]);
        showInvalidSupport();
        return false;
      }
      supports[4] = qty;
      supports[1] = calculSupportsUni();
      supportUni.val(supports[1]);
    });
  };
  const unactiveSupportsEvent = () => {
    supportUni.off('change');
    supportDbl.off('change');
    supportTpl.off('change');
    supportQdl.off('change');
  }
  displaySupports();
  editSupports.on('click', (e) => {
    if (supportUni.prop('disabled')) {
      supportUni.removeAttr('disabled');
      supportDbl.removeAttr('disabled');
      supportTpl.removeAttr('disabled');
      supportQdl.removeAttr('disabled');
      activeSupportsEvent();
    } else {
      unactiveSupportsEvent();
      supportUni.prop('disabled', true);
      supportDbl.prop('disabled', true);
      supportTpl.prop('disabled', true);
      supportQdl.prop('disabled', true);
    }
  })

  const add = (ev) => {
    $('.poste.new').removeClass('new');
    $('.postes').append(template);
    calculSupportsTotal();
    initPoste();
    $('.export').show();
  }

  const send = (ev) => {
    $('.poste .invalid-feedback').hide();
    const lines = $('.poste');
    const len = lines.length;
    lines.each(function(i, e) {
      const poste = $('.selectPoste option:selected', this).val();
      if (poste.length <= 0) {
        $('.element .invalid-feedback', e).show();
        return false;
      }
      const qty = parseInt($('.qty', this).val(), 10);
      const color = $('.selectColor option:selected', this).val();
      if (debug) console.log('Color', $('.selectColor option:selected', this));
      if (color.length <= 0) {
        $('.color .invalid-feedback', e).show();
        return false;
      }
      const compo = findCompoFromId(e.dataset.compo);
      const cmdKeys = Object.keys(commande);
      const option = $('input.option', this).is(':checked');
      if (debug) console.log('send', {poste, qty, color, option, compo, cmdKeys});
      if (compo.elements.hasOwnProperty('mecanisme')) {
        if (Array.isArray(compo.elements.mecanisme.ref)) {
          for (let i = 0; i < compo.elements.mecanisme.ref.length; i++) {
            if (cmdKeys.indexOf(compo.elements.mecanisme.ref[i]) < 0) {
              commande[compo.elements.mecanisme.ref[i]] = 0;
            }
            commande[compo.elements.mecanisme.ref[i]] += qty * compo.elements.mecanisme.qty;
          }
        } else {
          if (cmdKeys.indexOf(compo.elements.mecanisme.ref) < 0) {
            commande[compo.elements.mecanisme.ref] = 0;
          }
          commande[compo.elements.mecanisme.ref] += qty * compo.elements.mecanisme.qty;
        }
      }

      if (compo.elements.hasOwnProperty('enjoliveur')) {
        if (compo.elements.enjoliveur.hasOwnProperty('couleurs')) {
          if (Array.isArray(compo.elements.enjoliveur.couleurs[color])) {
            for (let r=0; r < compo.elements.enjoliveur.couleurs[color].length; r++) {
              if (cmdKeys.indexOf(compo.elements.enjoliveur.couleurs[color][r])) {
                commande[compo.elements.enjoliveur.couleurs[color][r]] = 0;
              }
              commande[compo.elements.enjoliveur.couleurs[color][r]] += qty;
            }
          } else {
            if (cmdKeys.indexOf(compo.elements.enjoliveur.couleurs[color]) < 0) {
              commande[compo.elements.enjoliveur.couleurs[color]] = 0;
            }
            commande[compo.elements.enjoliveur.couleurs[color]] += qty;
          }
        } else if (compo.elements.enjoliveur.hasOwnProperty('ref')) {
          if (cmdKeys.indexOf(compo.elements.enjoliveur.ref) < 0) {
            commande[compo.elements.enjoliveur.ref] = 0;
          }
          commande[compo.elements.enjoliveur.ref] += qty;
        }
        if (compo.type === 'commande' && compo.elements.hasOwnProperty('voyant')) {
          if (option && compo.elements.voyant.hasOwnProperty('option')) {
            if (cmdKeys.indexOf(compo.elements.voyant.ref) < 0) {
              commande[compo.elements.voyant.ref] = 0;
            }
            commande[compo.elements.voyant.ref] += qty;
          } else if (!compo.elements.voyant.hasOwnProperty('option')) {
            if (cmdKeys.indexOf(compo.elements.voyant.ref) < 0) {
              commande[compo.elements.voyant.ref] = 0;
            }
            commande[compo.elements.voyant.ref] += compo.elements.voyant.qty;
          }
        }
      }
      if (option && compo.elements.hasOwnProperty('options')) {
        if (cmdKeys.indexOf(compo.elements.options.ref) < 0) {
          commande[compo.elements.options.ref] = 0;
        }
        commande[compo.elements.options.ref] += qty;
      }
      
      if ((i+1) >= len) {
        /* calculSupportsTotal();
        supports[1] = calculSupportsUni(); */
        const result = $('#result tbody');
        result.empty();
        const cmdLines = Object.keys(commande);
        let index = 0;
        cmdLines.forEach((e, i) => {
          const composant = composants[e.replace(/\s/g, "")];
          let label = composant?.label ? composant.label : "";
          const link = composant?.href ? 'https://www.legrand.fr' + composant.href : null;
          if (link) {
            label = `<a href="${link}" target="_blank">${label}</a>`;
          }
          result.append(`<tr>
            <th scope="row">${i+1}</th>
            <td>${label}</td>
            <td>${e}</td>
            <td>${commande[e]}</td>
          </tr>`);
          index = i;
        });
        index++;
        if (supports[1] > 0) {
          result.append(`<tr><th scope="row">${index+1}</th><td>${composants['080251'].label}</td><td>0 802 51</td><td>${supports[1]}</td></tr>`);
          index++;
        }
        if (supports[2] > 0) {
          result.append(`<tr><th scope="row">${index+1}</th><td>${composants['080252'].label}</td><td>0 802 52</td><td>${supports[2]}</td></tr>`);
          index++;
        }
        if (supports[3] > 0) {
          result.append(`<tr><th scope="row">${index+1}</th><td>${composants['080253'].label}</td><td>0 802 53</td><td>${supports[3]}</td></tr>`);
          index++;
        }
        if (supports[4] > 0) {
          result.append(`<tr><th scope="row">${index+1}</th><td>${composants['080254'].label}</td><td>0 802 54</td><td>${supports[4]}</td></tr>`);
        }
        const chantier = $chantier.val();
        $('#result tfoot').append(`<tr><td>Ref. Chantier:</td><td class="chantier">${chantier}</td></tr>`);
        
        const btnPrint = `<button id="printResult" class="btn btn-warning d-print-none" title="Imprimer votre bon de commande"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-printer" viewBox="0 0 16 16">
  <path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1"/>
  <path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4zm1 5a2 2 0 0 0-2 2v1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v-1a2 2 0 0 0-2-2zm7 2v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1"/>
</svg></button>`;
        $('#result tfoot tr').append(`<td>${btnPrint}</td>`);
        const today = new Date(Date.now());
        $('#today').text(today.toLocaleString());
        $('#result').show();
        document.getElementById('result').scrollIntoView();
        $('#printResult').on('click', () => {
          var WinPrint = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');
          WinPrint.document.write('<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" media="screen,print" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">');
          WinPrint.document.write('<style type="text/css">#result .chantier {font-weight: bold} td a {color: unset; text-decoration: unset; cursor: unset;} td a:hover {color:unset}</style>');
          WinPrint.document.write(document.getElementById('result').outerHTML);
          WinPrint.document.close();
          WinPrint.addEventListener("beforeprint", (event) => {
            WinPrint.document.title = `Commande Celiane - ${chantier} - ${today.toLocaleString()}`;
          });
          WinPrint.focus();
          WinPrint.print();
        })
      }
    });
  }

  /**
   * Permet de remettre le formulaire à zéro
   */
  const recycle = () => {
    // Nettoyer les champs Chantier et Color
    $chantier.val('');
    $defaultColor.val($("option:first", $defaultColor).val());

    // Supprimer les lignes de postes
    $('.postes .poste').remove();
    $('.postes').append(template);

    // Remettre les supports à zéro
    supports[1] = 0; supports[2] = 0; supports[3] = 0; supports[4] = 0; supports.total = 0;
    displaySupports();

    // Nettoyer la zone du bon de commande
    $('#result tbody').empty();
    $('#result tfoot').empty();
    // On cache la partie commande
    $('#result').hide();
    $('.export').hide();

    // On initialise la première ligne de poste
    initPoste();
    
    // On scroll jusqu'à la ligne du poste
    $('#labelChantier').get(0).scrollIntoView();
    $chantier.focus();
  }

  /**
   * Permet d'exporter une liste de postes
   */
  const exportList = () => {
    const JSONToFile = (obj, filename) => {
      const blob = new Blob([JSON.stringify(obj, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.json`;
      a.click();
      URL.revokeObjectURL(url);
    };
    if (debug) console.log('exportList');
    const lines = $('.poste');
    const len = lines.length;
    if (len <= 0) {
      // Afficher une popup pour avertir
      return false;
    }
    const chantier = $chantier.val();
    const defaultColor = $('option:selected', $defaultColor).val();
    const today = new Date(Date.now());
    const project = {
      chantier: chantier,
      defaultColor: defaultColor,
      date: today.toISOString(),
      postes: {},
      supports
    };
    if (debug) console.log('exportList project', project);
    lines.each(function(i, e) {
      if (!e.dataset?.compo) {
        if (debug) console.error('exportList compo dataset not fournd');
        return false;
      }
      const poste = $('.selectPoste option:selected', this).val();
      if (poste.length <= 0) {
        if (debug) console.error('exportList selectPoste empty');
        return false;
      }
      const qty = parseInt($('.qty', this).val(), 10);
      const color = $('.selectColor option:selected', this).val();
      if (color.length <= 0) {
        if (debug) console.error('exportList color empty');
        return false;
      }
      // const compo = findCompoFromId(e.dataset.compo);
      // const option = $('input.option', this).is(':checked');
      if (debug) console.log('send', {poste, qty, color, compo: e.dataset.compo});
      project.postes[e.dataset.compo] = { qty: qty, color: color};
      if ($('input.option', this).length > 0) {
        project.postes[e.dataset.compo].option = $('input.option', this).is(':checked');
      }
      if (i >= len-1) {
        JSONToFile(project, `Projet Celiane - ${chantier} - ${today.toLocaleString()}`);
      }
    });
  }
  const inputFile = $('#projectFile');
  const btnImportProject = $('.importProject');
  inputFile.on('change', function(e) {
    /** @type HTMLInputElement */
    const input = this;
    
    const curFiles = input.files;
    if (curFiles.length > 0) {
      if (curFiles[0].type !== 'application/json') {
        // Ajouter un message d'erreur
        $('.invalid-feedback.file').show();
      } else {
        $('.invalid-feedback.file').hide();
        btnImportProject.removeAttr('disabled');
      }
    } else {
      btnImportProject.prop('disabled', true);
    }
  });
  btnImportProject.on('click', (e) => {
    /** @type HTMLInputElement */
    const input = document.getElementById('projectFile');
    const curFiles = input.files;
    if (curFiles.length > 0 && curFiles[0].type === 'application/json') {
      try {
        const fr = new FileReader();
        fr.onload = (e) => {
          const project = JSON.parse(e.target.result);
          console.log('Project uploaded', project);
          // TODO Nettoyer le formulaire
          if (!project.hasOwnProperty('chantier')) {
            // Mauvais fichier
            if (debug) console.error('Le fichier n\'est pas correct');
            return false;
          }
          $('#chantier').val(project.chantier);
          $('option', $defaultColor).removeAttr('selected');
          $(`option[value="${project.defaultColor}"]`, $defaultColor).prop('selected', true);
          const posteKeys = Object.keys(project.postes);
          for (let p = 0, _len = posteKeys.length; p < _len; p++) {
            const id = posteKeys[p];
            const poste = project.postes[id];
            if (debug) console.log('Poste[%d]', id, poste);
            const compo = findCompoFromId(id);
            const parent = $('.poste.new');
            const colors = Object.keys(compo.elements.enjoliveur.couleurs);
            parent.get(0).dataset.compo = id;
            parent.get(0).dataset.support = compo.elements.support;
            $(`.poste.new .selectPoste option[value="${id}"]`).prop("selected", true);
            $(`.poste.new .qty`).val(poste.qty);
            if (debug) console.log('Couleurs', colors);
            $('.poste.new .selectColor').empty();
            colors.forEach((e) => {
              let selected = '';
              if (poste.color == e) { selected = 'selected'; }
              $('.poste.new .selectColor').append(`<option value="${e}"${selected}>${e}</option>`);
            });
            $('.poste.new').removeClass('new');
            $('.postes').append(template);
            initPoste();
          }
          const supportKeys = Object.keys(project.supports);
          for (let s = 0, _len = supportKeys.length; s < _len; s++) {
            const key = supportKeys[s];
            supports[key] = project.supports[key];
            if (debug) console.log('Support[%s]: ', key, {project: project.supports[key], actual: supports[key]});
          }
          if (debug) console.log('Supports A: ', supports);
          displaySupports(true);
          if (debug) console.log('Supports B: ', supports);
        };
        fr.readAsText(curFiles.item(0));
      } catch (err) {
        console.error(err);
      }
    }
  });

  $('.add').on('click', add);
  $('.send').on('click', send);
  $('#recycle').on('click', recycle);
  $('.export').on('click', exportList);

  initPoste();
  $chantier.focus();
});