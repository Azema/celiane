async function printJSON(file) {
  const response = await fetch(file);
  return await response.json();
}

$(async function() {
  const compositions = await printJSON('/celiane/js/celiane.json');
  const commande = {};
  const supports = {1: 0, 2: 0, 3: 0, 4: 0, total: 0};
  const optionsPostes = [];
  const template = $('script[data-template="rowPoste"]').text();
  const supportUni = $('#support-uni'),
        supportDbl = $('#support-dbl'),
        supportTpl = $('#support-tpl'),
        supportQdl = $('#support-qdl'),
        editSupports = $('.editSupports');

  const debug = true;
  $('#result').hide();

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
  })

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
  const displaySupports = () => {
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
      $('div.option', parent).remove();
      const defaultColor = $('.defaultColor option:selected').val();
      const val = this.value;
      const color = $('.selectColor', parent);
      compo = findCompoFromId(val);
      parent.get(0).dataset.compo = val;
      parent.get(0).dataset.support = compo.elements.support;
      if (compo.elements.support > 0) supports[compo.elements.support]++;
      displaySupports();
      if (compo.elements.enjoliveur.hasOwnProperty('couleurs')) {
        color.empty();
        if (debug) console.log('select change', {defaultColor, val, compo, color, parent, compositions});
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
      // TODO Gérer l'affichage des options
      if (compo.elements.hasOwnProperty('options')) {
        parent.find('.action').before(`<div class="col-md-1 col-sm-2 option" title="${compo.elements.options.name}">
              <label for="checkOption" class="form-check-label">Option <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-info-circle-fill" viewBox="0 0 16 16">
  <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2"/>
</svg></label>
              <input class="form-check-input option" type="checkbox" value="" id="checkOption">
            </div>`);
      }
      if (compo.elements?.voyant?.option) {
        parent.find('.action').before(`<div class="col-md-1 col-sm-2 option" title="Ajouter le voyant en option">
          <label for="checkOption" class="form-check-label">Option <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-info-circle-fill" viewBox="0 0 16 16">
  <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2"/>
</svg></label>
          <input class="form-check-input option" type="checkbox" value="" id="checkOption">
        </div>`);
      }
      $('.element .invalid-feedback', parent).hide();
    });
    qty.on('change', function(ev) {
      // if (debug) console.log('Qty change');
      if (compo && compo.elements.support == 0) return;
      supports[1] = 0; supports[2] = 0; supports[3] = 0; supports[4] = 0;
      $('.qty').each((i, e) => {
        const par = $(e).parents('.poste').first();
        const support = parseInt(par.get(0).dataset.support, 10);
        // if (debug) console.log('support', support);
        if (support > 0) supports[support] += parseInt($(e).val(), 10);
      });
      supportUni.val(supports[1]);
      supportDbl.val(supports[2]);
      supportTpl.val(supports[3]);
      supportQdl.val(supports[4]);
    });
    del.on('click', (ev) => {
      // if (debug) console.log('Parent', parent);
      parent.remove();
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
  supportUni.val(supports[1]);
  supportDbl.val(supports[2]);
  supportTpl.val(supports[3]);
  supportQdl.val(supports[4]);
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
    // if (debug) console.log('Template', template);
    $('.poste.new').removeClass('new');
    /* calculSupportsTotal();
    supports[1] = calculSupportsUni();
    supportUni.val(supports[1]); */
    $('.postes').append(template);
    initPoste();
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
          if (cmdKeys.indexOf(compo.elements.voyant.ref) < 0) {
            commande[compo.elements.voyant.ref] = 0;
          }
          commande[compo.elements.voyant.ref] += compo.elements.voyant.qty;
        }
      }
      if (option && compo.elements.hasOwnProperty('options')) {
        if (cmdKeys.indexOf(compo.elements.options.ref) < 0) {
          commande[compo.elements.options.ref] = 0;
        }
        commande[compo.elements.options.ref] += qty;
      }
      
      if (option && compo.elements?.voyant.hasOwnProperty('option')) {
        if (cmdKeys.indexOf(compo.elements.voyant.ref) < 0) {
          commande[compo.elements.voyant.ref] = 0;
        }
        commande[compo.elements.voyant.ref] += qty;
      }
      if ((i+1) >= len) {
        /* calculSupportsTotal();
        supports[1] = calculSupportsUni(); */
        const result = $('#result tbody');
        result.empty();
        const cmdLines = Object.keys(commande);
        let index = 0;
        cmdLines.forEach((e, i) => {
          result.append(`<tr>
            <th scope="row">${i+1}</th>
            <td>${e}</td>
            <td>${commande[e]}</td>
          </tr>`);
          index = i;
        });
        index++;
        if (supports[1] > 0) {
          result.append(`<tr><th scope="row">${index+1}</th><td>0 802 51</td><td>${supports[1]}</td></tr>`);
          index++;
        }
        if (supports[2] > 0) {
          result.append(`<tr><th scope="row">${index+1}</th><td>0 802 52</td><td>${supports[2]}</td></tr>`);
          index++;
        }
        if (supports[3] > 0) {
          result.append(`<tr><th scope="row">${index+1}</th><td>0 802 53</td><td>${supports[3]}</td></tr>`);
          index++;
        }
        if (supports[4] > 0) {
          result.append(`<tr><th scope="row">${index+1}</th><td>0 802 54</td><td>${supports[4]}</td></tr>`);
        }
        const chantier = $('#chantier').val();
        $('#result tfoot').append(`<tr><td>Ref. Chantier:</td><td class="chantier">${chantier}</td></tr>`);
        $('#result').show();
        document.getElementById('result').scrollIntoView();
      }
    });
  }

  $('.add').on('click', add);
  $('.send').on('click', send);

  initPoste();
});