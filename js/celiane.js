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
        supportQdl = $('#support-qdl');
  $('.result').hide();

  compositions.forEach((e, i) => {
    optionsPostes.push(`<option value="${e.id}">${e.name}</option>`);
  });

  const calculSupportsUni = () => {
    let total = supports.total;
    total = total - supports[4] * 4;
    total = total - supports[3] * 3;
    total = total - supports[2] * 2;
    return total;
  }
  const calculSupportsTotal = () => {
    let total = 0;
    $('.qty').each((i, e) => {
      total += parseInt($(e).val(), 10);
    });
    supports.total = total;
  }

  const initPoste = () => {
    const parent = $('.poste.new');
    const select = $('.selectPoste', parent);
    const qty = $('.qty', parent);
    const del = $('.del', parent);
    optionsPostes.forEach((e) => {
      select.append(e);
    });
    select.on('change', function(ev) {
      const defaultColor = $('.defaultColor option:selected').val();
      const val = this.value;
      const index = parseInt(val.substring(1), 10)-1;
      const color = $('.selectColor', parent);
      color.empty();
      console.log('select change', {defaultColor, val, index, compo: compositions[index], color, parent, compositions});
      const colors = Object.keys(compositions[index].elements.enjoliveur.couleurs);
      console.log('Couleurs', colors);
      color.append('<option selected>Select Color</option>');
      colors.forEach((e) => {
        let selected = '';
        if (defaultColor && defaultColor == e) { selected = 'selected'; }
        color.append(`<option value="${e}"${selected}>${e}</option>`);
      });
    });
    qty.on('change', function(ev) {
      let total = 0;
      $('.qty').each((i, e) => {
        total += parseInt($(e).val(), 10);
      });
      if (total === supports.total+1) {
        supports.total++;
        supports[1]++;
      } else if (total === supports.total-1) {
        supports.total--;
        supports[1]--;
      } else {
        supports.total = total;
        supports[1] = calculSupportsUni();
      }
      supportUni.val(supports[1]);
    });
    del.on('click', (ev) => {
      // console.log('Parent', parent);
      parent.remove();
    });
    select.focus();
  }

  /*
   *  Supports
   */
  supportUni.on('change', function(ev) {
    const qty = parseInt($(this).val(), 10);
    supports[1] = calculSupportsUni();
  });
  supportDbl.on('change', function(ev) {
    const qty = parseInt($(this).val(), 10),
          total = qty * 2,
          remaining = supports.total - ((supports[4] * 4) + (supports[3] * 3));
    console.log('supportDbl', {uni: supports[1], qty});
    if (total > remaining) {
      supportDbl.val(supports[2]);
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
    if (total > supports[1]) {
      supportTpl.val(supports[3]);
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
    if (total > supports[1]) {
      supportQdl.val(supports[4]);
      return false;
    }
    supports[4] = qty;
    supports[1] = calculSupportsUni();
    supportUni.val(supports[1]);
  });
  supportUni.val(supports[1]);
  supportDbl.val(supports[2]);
  supportTpl.val(supports[3]);
  supportQdl.val(supports[4]);

  const add = (ev) => {
    // console.log('Template', template);
    $('.poste.new').removeClass('new');
    $('.postes').append(template);
    initPoste();
  }

  const send = (ev) => {
    const lines = $('.poste');
    const len = lines.length;
    lines.each(function(i, e) {
      const poste = $('.selectPoste option:selected', this).val();
      const qty = parseInt($('.qty', this).val(), 10);
      const color = $('.selectColor option:selected', this).val();
      const index = parseInt(poste.substring(1), 10)-1;
      const compo = compositions[index];
      const cmdKeys = Object.keys(commande);
      console.log('send', {poste, qty, color, index, compo, cmdKeys});
      if (cmdKeys.indexOf(compo.elements.mecanisme.ref) < 0) {
        commande[compo.elements.mecanisme.ref] = 0;
      }
      commande[compo.elements.mecanisme.ref] += qty * compo.elements.mecanisme.qty;

      if (cmdKeys.indexOf(compo.elements.enjoliveur.couleurs[color]) < 0) {
        commande[compo.elements.enjoliveur.couleurs[color]] = 0;
      }
      commande[compo.elements.enjoliveur.couleurs[color]] += qty;
      if (compo.type === 'commande' && compo.elements.hasOwnProperty('voyant')) {
        if (cmdKeys.indexOf(compo.elements.voyant.ref) < 0) {
          commande[compo.elements.voyant.ref] = 0;
        }
        commande[compo.elements.voyant.ref] += compo.elements.voyant.qty;
      }
      if ((i+1) >= len) {
        calculSupportsTotal();
        supports[1] = calculSupportsUni();
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