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
        console.log('select change', {defaultColor, val, compo, color, parent, compositions});
        const colors = Object.keys(compo.elements.enjoliveur.couleurs);
        console.log('Couleurs', colors);
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
      $('.element .invalid-feedback', parent).hide();
    });
    qty.on('change', function(ev) {
      console.log('Qty change');
      if (compo && compo.elements.support == 0) return;
      supports[1] = 0; supports[2] = 0; supports[3] = 0; supports[4] = 0;
      $('.qty').each((i, e) => {
        const par = $(e).parents('.poste').first();
        const support = parseInt(par.get(0).dataset.support, 10);
        // console.log('support', support);
        if (support > 0) supports[support] += parseInt($(e).val(), 10);
      });
      supportUni.val(supports[1]);
      supportDbl.val(supports[2]);
      supportTpl.val(supports[3]);
      supportQdl.val(supports[4]);
    });
    del.on('click', (ev) => {
      // console.log('Parent', parent);
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
      console.log('supportDbl', {uni: supports[1], qty});
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
      console.log('supportTpl', {uni: supports[1], qty});
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
      console.log('supportQdl', {uni: supports[1], qty});
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
    // console.log('Template', template);
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
      console.log('Color', $('.selectColor option:selected', this));
      if (color.length <= 0) {
        $('.color .invalid-feedback', e).show();
        return false;
      }
      const compo = findCompoFromId(e.dataset.compo);
      const cmdKeys = Object.keys(commande);
      console.log('send', {poste, qty, color, compo, cmdKeys});
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
          if (cmdKeys.indexOf(compo.elements.enjoliveur.couleurs[color]) < 0) {
            commande[compo.elements.enjoliveur.couleurs[color]] = 0;
          }
          commande[compo.elements.enjoliveur.couleurs[color]] += qty;
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
        result.append(`<tr><th scope="row">${index+1}</th><td>0 802 51</td><td>${supports[1]}</td></tr>`);
        index++;
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