// ゆっくり台本ととのえ〜る
// 最終更新: 2024年3月

function formatScript() {
  const text = document.getElementById('input').value.trim();
  if (!text) {
    alert('セリフを入力してください');
    return;
  }

  const output = document.getElementById('output');
  output.innerHTML = '';

  // テーブル作成
  const table = document.createElement('table');
  table.className = 'output-table';

  // ヘッダー
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  const thLineNumber = document.createElement('th');
  thLineNumber.className = 'line-number';
  thLineNumber.textContent = 'No.';
  const thReimu = document.createElement('th');
  thReimu.className = 'reimu';
  thReimu.textContent = '霊夢';
  const thMarisa = document.createElement('th');
  thMarisa.className = 'marisa';
  thMarisa.textContent = '魔理沙';
  const thSerif = document.createElement('th');
  thSerif.className = 'serif';
  thSerif.textContent = 'セリフ';
  headerRow.appendChild(thLineNumber);
  headerRow.appendChild(thReimu);
  headerRow.appendChild(thMarisa);
  headerRow.appendChild(thSerif);
  thead.appendChild(headerRow);
  table.appendChild(thead);

  // 本文
  const tbody = document.createElement('tbody');
  const lines = text.split(/\r?\n/).filter(Boolean);
  lines.forEach((line, idx) => {
    // 話者名の自動判別
    let reimuText = '';
    let marisaText = '';
    let serifText = '';
    const reimuMatch = line.match(/^霊夢[：:](.*)$/);
    const marisaMatch = line.match(/^魔理沙[：:](.*)$/);
    if (reimuMatch) {
      reimuText = reimuMatch[1].trim();
    } else if (marisaMatch) {
      marisaText = marisaMatch[1].trim();
    } else {
      serifText = line.trim();
    }

    const reimuSentences = reimuText ? splitIntoSentences(reimuText) : [];
    const marisaSentences = marisaText ? splitIntoSentences(marisaText) : [];
    const serifSentences = (!reimuText && !marisaText) ? splitIntoSentences(serifText) : [];

    const maxLen = Math.max(reimuSentences.length, marisaSentences.length, serifSentences.length, 1);
    for (let i = 0; i < maxLen; i++) {
      const row = document.createElement('tr');
      // 行番号セル
      const lineNumberCell = document.createElement('td');
      lineNumberCell.className = 'line-number';
      lineNumberCell.textContent = idx + 1;
      lineNumberCell.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showContextMenu(e, row);
      });
      row.appendChild(lineNumberCell);
      // 霊夢表情
      const reimuCell = document.createElement('td');
      let reimuVal = reimuSentences[i] || '';
      const reimuSelect = createFaceSelect('霊夢', null, (e) => {
        marisaSelect.disabled = !!e.target.value;
        if (e.target.value) {
          marisaSelect.value = '';
        }
        updateFormattedText(serifInput, e.target.value, marisaSelect.value, reimuVal || marisaVal || serifVal);
      }, false);
      reimuCell.appendChild(reimuSelect);
      row.appendChild(reimuCell);
      // 魔理沙表情
      const marisaCell = document.createElement('td');
      let marisaVal = marisaSentences[i] || '';
      const marisaSelect = createFaceSelect('魔理沙', null, (e) => {
        reimuSelect.disabled = !!e.target.value;
        if (e.target.value) {
          reimuSelect.value = '';
        }
        updateFormattedText(serifInput, reimuSelect.value, e.target.value, reimuVal || marisaVal || serifVal);
      }, false);
      marisaCell.appendChild(marisaSelect);
      row.appendChild(marisaCell);
      // セリフ欄
      const serifCell = document.createElement('td');
      serifCell.className = 'serif-cell';
      let serifVal = reimuVal || marisaVal || serifSentences[i] || '';
      const serifInput = document.createElement('textarea');
      serifInput.value = insertLineBreaks(serifVal, 30, '霊夢');
      serifInput.className = 'script-text serif-textarea';
      serifInput.addEventListener('input', () => {
        updateFormattedText(serifInput, reimuSelect.value, marisaSelect.value, serifInput.value);
      });
      serifCell.appendChild(serifInput);
      row.appendChild(serifCell);
      tbody.appendChild(row);
    }
  });
  table.appendChild(tbody);
  output.appendChild(table);
}

function clearOutput() {
  document.getElementById('input').value = '';
  document.getElementById('output').innerHTML = '';
}

function splitIntoSentences(text) {
  // まず「…」で改行、「。」で区切る。ただし「！」は区切りとしない。
  let sentences = [];
  let buffer = '';
  for (let i = 0; i < text.length; i++) {
    buffer += text[i];
    // 「…」で改行
    if (text[i] === '…') {
      sentences.push(buffer);
      buffer = '';
      continue;
    }
    // 「。」で区切る
    if (text[i] === '。') {
      sentences.push(buffer);
      buffer = '';
      continue;
    }
  }
  if (buffer) sentences.push(buffer);

  // 50字超の文をさらに分割
  let result = [];
  sentences.forEach(sentence => {
    let s = sentence;
    while (s.length > 50) {
      // 区切り候補：「。」→「、」→スペース
      let cut = s.lastIndexOf('。', 50);
      if (cut === -1) cut = s.lastIndexOf('、', 50);
      if (cut === -1) cut = s.lastIndexOf(' ', 50);
      if (cut === -1) cut = 50;
      result.push(s.slice(0, cut + 1).trim());
      s = s.slice(cut + 1).trim();
    }
    if (s) result.push(s);
  });
  return result.filter(Boolean);
}

function createFaceSelect(name, currentFace, onChange, disabled) {
  const select = document.createElement('select');
  select.onchange = onChange;
  select.disabled = disabled;
  
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = '表情を選択';
  select.appendChild(defaultOption);

  if (name === '霊夢') {
    const reimuFaces = ['通常', '笑顔', 'ポカーン', '＞＜', '泣', 'ウインク', '汗', '困り眉', '強気'];
    reimuFaces.forEach(face => {
      const option = document.createElement('option');
      option.value = face;
      option.textContent = face;
      if (currentFace === face) option.selected = true;
      select.appendChild(option);
    });
  } else if (name === '魔理沙') {
    const marisaFaces = ['通常', '強気', '閉じ目・強気', '閉じ目', 'にやり', '笑顔', 'ウインク', '困り眉'];
    marisaFaces.forEach(face => {
      const option = document.createElement('option');
      option.value = face;
      option.textContent = face;
      if (currentFace === face) option.selected = true;
      select.appendChild(option);
    });
  }

  return select;
}

function updateFormattedText(element, reimuFace, marisaFace, text) {
  // input要素の場合は何もしない
  if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') return;
  let result = '';
  if (reimuFace) result += `霊夢（${reimuFace}）　`;
  if (marisaFace) result += `魔理沙（${marisaFace}）　`;
  result += text;
  element.textContent = result;
}

function copyOutput() {
  const output = document.getElementById('output');
  const text = Array.from(output.getElementsByClassName('script-text'))
    .map(div => div.textContent)
    .join('\n');
  navigator.clipboard.writeText(text);
  alert('コピーしました！');
}

function downloadCSV() {
  const output = document.getElementById('output');
  const lines = Array.from(output.getElementsByClassName('script-text'))
    .map(textarea => {
      const text = textarea.value;
      const tr = textarea.closest('tr');
      const reimuCell = tr.children[0].querySelector('select');
      const marisaCell = tr.children[1].querySelector('select');
      let chara = '';
      if (reimuCell && reimuCell.value) {
        chara = `霊夢（${reimuCell.value}）`;
      } else if (marisaCell && marisaCell.value) {
        chara = `魔理沙（${marisaCell.value}）`;
      }
      return `"${chara}","${text.replace(/"/g, '""')}"`;
    });
  const csv = 'キャラクター,セリフ\n' + lines.join('\n');
  downloadFile(csv, 'script.csv', 'text/csv');
}

function downloadTXT() {
  const output = document.getElementById('output');
  const lines = Array.from(output.getElementsByClassName('script-text'))
    .map(textarea => {
      const text = textarea.value;
      const tr = textarea.closest('tr');
      const reimuCell = tr.children[0].querySelector('select');
      const marisaCell = tr.children[1].querySelector('select');
      let chara = '';
      if (reimuCell && reimuCell.value) {
        chara = `霊夢（${reimuCell.value}）`;
      } else if (marisaCell && marisaCell.value) {
        chara = `魔理沙（${marisaCell.value}）`;
      }
      return `${chara}\t${text}`;
    });
  const txt = lines.join('\n');
  downloadFile(txt, 'script.txt', 'text/plain');
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function cleanScriptText(text) {
  // 行頭の話者名（霊夢：や魔理沙：など）、：、URLのみ削除
  return text
    .replace(/^\s*(霊夢|魔理沙)[：:]/gm, '') // 行頭の話者名+：
    .replace(/[：:]/g, '')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/\s+/g, ' ') // 連続スペースを1つに
    .trim();
}

function loadDocx() {
  const input = document.getElementById('fileInput');
  if (!input.files.length) {
    alert('ファイルを選択してください');
    return;
  }
  const file = input.files[0];
  const reader = new FileReader();
  reader.onload = function(e) {
    mammoth.extractRawText({arrayBuffer: e.target.result})
      .then(result => {
        const cleaned = cleanScriptText(result.value.trim());
        const lines = cleaned.split(/\r?\n/);
        if (lines.length > 1000) {
          alert('台本の行数が多すぎます（1000行以上）。一部のみ表示される場合があります。');
        }
        document.getElementById('input').value = cleaned;
        formatScript();
      })
      .catch(err => alert('ファイルの読み込みに失敗しました: ' + err));
  };
  reader.readAsArrayBuffer(file);
}

function insertLineBreaks(text, maxLen = 30, speaker = '') {
  // スペースをすべて削除
  text = text.replace(/\s+/g, '');
  let result = '';
  let s = text;
  // 性格による改行基準（例：霊夢は短め、魔理沙は長め）
  let len = maxLen;
  if (speaker === '霊夢') len = 20;
  if (speaker === '魔理沙') len = 40;
  let safety = 0; // 無限ループ防止
  while (s.length > len && safety < 1000) {
    // 記号（、。！？…）の直前・直後で改行しない
    let forbiddenMark = /[、。！？…]/;
    let cut = len;
    // len位置が記号なら、その前後を避けて改行
    if (forbiddenMark.test(s[cut]) || forbiddenMark.test(s[cut - 1])) {
      // 記号の直前・直後なら、前方にずらす
      let back = cut - 1;
      while (back > 0 && forbiddenMark.test(s[back])) back--;
      if (back > 0) cut = back;
      else {
        // それでもだめなら後方にずらす
        let forward = cut + 1;
        while (forward < s.length && forbiddenMark.test(s[forward])) forward++;
        if (forward < s.length) cut = forward;
      }
    }
    // 安全策: cutが0や-1の場合はlenで分割
    if (cut <= 0) cut = len;
    result += s.slice(0, cut) + '\n';
    s = s.slice(cut);
    safety++;
  }
  result += s;
  return result;
}

// コンテキストメニュー関連の関数を追加
function showContextMenu(e, targetRow) {
  // 既存のメニューを削除
  const existingMenu = document.querySelector('.context-menu');
  if (existingMenu) {
    existingMenu.remove();
  }

  // 新しいメニューを作成
  const menu = document.createElement('div');
  menu.className = 'context-menu';
  
  // メニューを一時的にbodyに追加してサイズを取得
  menu.style.visibility = 'hidden';
  menu.style.position = 'absolute';
  document.body.appendChild(menu);
  
  // メニュー項目を追加
  const insertAbove = document.createElement('div');
  insertAbove.className = 'context-menu-item';
  insertAbove.textContent = '上に1行挿入';
  insertAbove.onclick = () => {
    insertNewRow(targetRow, 'above');
    menu.remove();
  };

  const insertBelow = document.createElement('div');
  insertBelow.className = 'context-menu-item';
  insertBelow.textContent = '下に1行挿入';
  insertBelow.onclick = () => {
    insertNewRow(targetRow, 'below');
    menu.remove();
  };

  menu.appendChild(insertAbove);
  menu.appendChild(insertBelow);

  // 区切り線を追加
  const divider = document.createElement('hr');
  divider.style.margin = '5px 0';
  divider.style.border = 'none';
  divider.style.borderTop = '1px solid #ccc';
  menu.appendChild(divider);

  // 削除メニュー項目を追加
  const deleteRow = document.createElement('div');
  deleteRow.className = 'context-menu-item delete';
  deleteRow.textContent = '行を削除';
  deleteRow.onclick = () => {
    deleteTargetRow(targetRow);
    menu.remove();
  };
  menu.appendChild(deleteRow);

  // メニューのサイズを取得
  const menuRect = menu.getBoundingClientRect();
  const menuWidth = menuRect.width;
  const menuHeight = menuRect.height;
  
  // 画面サイズを取得
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  
  // クリックされたセルの位置を取得
  const clickedCell = e.target;
  const cellRect = clickedCell.getBoundingClientRect();
  
  // スクロール位置を取得
  const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
  const scrollY = window.pageYOffset || document.documentElement.scrollTop;
  
  // 該当行の左横に表示する位置を計算（スクロール位置を考慮）
  let left = cellRect.left + scrollX - menuWidth - 10; // セルの左側に10pxの余白を空けて配置
  let top = cellRect.top + scrollY; // セルの上端に合わせる
  
  // 左端にはみ出る場合は右側に表示
  if (left < 10) {
    left = cellRect.right + scrollX + 10;
  }
  
  // 下端にはみ出る場合は上に調整
  if (top + menuHeight > windowHeight + scrollY) {
    top = windowHeight + scrollY - menuHeight - 10;
  }
  
  // 上端にはみ出る場合は下に調整
  if (top < scrollY + 10) {
    top = scrollY + 10;
  }
  
  // 位置を設定
  menu.style.left = left + 'px';
  menu.style.top = top + 'px';
  menu.style.visibility = 'visible';

  // メニュー以外をクリックしたら閉じる
  document.addEventListener('click', function closeMenu(e) {
    if (!menu.contains(e.target)) {
      menu.remove();
      document.removeEventListener('click', closeMenu);
    }
  });
}

function insertNewRow(targetRow, position) {
  const tbody = targetRow.parentNode;
  const newRow = document.createElement('tr');

  // 行番号セル
  const lineNumberCell = document.createElement('td');
  lineNumberCell.className = 'line-number';
  lineNumberCell.textContent = position === 'above' ? targetRow.cells[0].textContent : (parseInt(targetRow.cells[0].textContent) + 1).toString();
  lineNumberCell.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    showContextMenu(e, newRow);
  });
  newRow.appendChild(lineNumberCell);

  // 霊夢表情
  const reimuCell = document.createElement('td');
  const reimuSelect = createFaceSelect('霊夢', null, (e) => {
    marisaSelect.disabled = !!e.target.value;
    if (e.target.value) {
      marisaSelect.value = '';
    }
    updateFormattedText(serifInput, e.target.value, marisaSelect.value, '');
  }, false);
  reimuCell.appendChild(reimuSelect);
  newRow.appendChild(reimuCell);

  // 魔理沙表情
  const marisaCell = document.createElement('td');
  const marisaSelect = createFaceSelect('魔理沙', null, (e) => {
    reimuSelect.disabled = !!e.target.value;
    if (e.target.value) {
      reimuSelect.value = '';
    }
    updateFormattedText(serifInput, reimuSelect.value, e.target.value, '');
  }, false);
  marisaCell.appendChild(marisaSelect);
  newRow.appendChild(marisaCell);

  // セリフ欄
  const serifCell = document.createElement('td');
  serifCell.className = 'serif-cell';
  const serifInput = document.createElement('textarea');
  serifInput.value = '';
  serifInput.className = 'script-text serif-textarea';
  serifInput.addEventListener('input', () => {
    updateFormattedText(serifInput, reimuSelect.value, marisaSelect.value, serifInput.value);
  });
  serifCell.appendChild(serifInput);
  newRow.appendChild(serifCell);

  // 行を挿入
  if (position === 'above') {
    tbody.insertBefore(newRow, targetRow);
  } else {
    tbody.insertBefore(newRow, targetRow.nextSibling);
  }

  // 行番号を更新
  updateLineNumbers();
}

function updateLineNumbers() {
  const rows = document.querySelectorAll('.output-table tbody tr');
  rows.forEach((row, index) => {
    row.cells[0].textContent = (index + 1).toString();
  });
}

// 行削除関数を修正
function deleteTargetRow(targetRow) {
  // ローカルストレージから設定を取得
  const skipConfirm = localStorage.getItem('skipDeleteConfirm') === 'true';

  if (skipConfirm) {
    // 確認をスキップして削除
    targetRow.remove();
    updateLineNumbers();
  } else {
    // カスタム確認ダイアログを作成
    const dialog = document.createElement('div');
    dialog.style.position = 'fixed';
    dialog.style.top = '50%';
    dialog.style.left = '50%';
    dialog.style.transform = 'translate(-50%, -50%)';
    dialog.style.background = 'white';
    dialog.style.padding = '20px';
    dialog.style.borderRadius = '8px';
    dialog.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    dialog.style.zIndex = '1001';
    dialog.style.minWidth = '300px';

    // メッセージ
    const message = document.createElement('p');
    message.textContent = 'この行を削除してもよろしいですか？';
    message.style.margin = '0 0 15px 0';
    dialog.appendChild(message);

    // チェックボックス
    const checkboxContainer = document.createElement('div');
    checkboxContainer.style.marginBottom = '15px';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = 'skipConfirm';
    const label = document.createElement('label');
    label.htmlFor = 'skipConfirm';
    label.textContent = '次回から表示しない';
    checkboxContainer.appendChild(checkbox);
    checkboxContainer.appendChild(label);
    dialog.appendChild(checkboxContainer);

    // ボタンコンテナ
    const buttonContainer = document.createElement('div');
    buttonContainer.style.textAlign = 'right';

    // キャンセルボタン
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'キャンセル';
    cancelButton.style.marginRight = '10px';
    cancelButton.style.padding = '5px 15px';
    cancelButton.onclick = () => {
      document.body.removeChild(dialog);
      document.body.removeChild(overlay);
    };

    // OKボタン
    const okButton = document.createElement('button');
    okButton.textContent = 'OK';
    okButton.style.padding = '5px 15px';
    okButton.onclick = () => {
      // チェックボックスの状態を保存
      localStorage.setItem('skipDeleteConfirm', checkbox.checked);
      // 行を削除
      targetRow.remove();
      updateLineNumbers();
      // ダイアログを閉じる
      document.body.removeChild(dialog);
      document.body.removeChild(overlay);
    };

    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(okButton);
    dialog.appendChild(buttonContainer);

    // オーバーレイ
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.background = 'rgba(0,0,0,0.5)';
    overlay.style.zIndex = '1000';

    document.body.appendChild(overlay);
    document.body.appendChild(dialog);
  }
}