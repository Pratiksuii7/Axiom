// lets bring football here yay
const ronaldo = document.getElementById('base-select');
const messi = document.getElementById('num-input');
const haaland = document.getElementById('error-msg');

// i dont like other football players nwow
const bin_out = document.getElementById('out-bin');
const oct_out = document.getElementById('out-oct');
const dec_out = document.getElementById('out-dec');
const hex_out = document.getElementById('out-hex');

const bin_card = document.getElementById('card-bin');
const oct_card = document.getElementById('card-oct');
const dec_card = document.getElementById('card-dec');
const hex_card = document.getElementById('card-hex');

const rubbishchecker = {
    '2': /^[01]+$/,
    '8': /^[0-7]+$/,
    '10': /^\d+$/,
    '16': /^[0-9A-Fa-f]+$/
};

//functions time, i guess
function isInputGood(val, base) {
    if (!val) {
        return true;
    }
    const pattern = rubbishchecker[base];
    if (pattern && !pattern.test(val)) return false; //uffffffffff.........

    const num = parseInt(val, base);
    if (isNaN(num) || num < 0 || num > Number.MAX_SAFE_INTEGER) return false;

    return true;
}

//more functions
function convertNumbers() {
    haaland.textContent = '';

    let val = messi.value.trim().toUpperCase();
    const base = parseInt(ronaldo.value); //suiii

    if (!isInputGood(val, base)) {
        const nameMap = {
            2: 'Binary(0-1)',
            8: 'Octal(0-7)',
            10: 'Decimal (0-9)',
            16: 'Hex (0-9, A-F)'
        };
        haaland.textContent = `Whoops! That ain't valid for ${nameMap[base]}. Check your digits.`;

        bin_out.textContent = oct_out.textContent = dec_out.textContent = hex_out.textContent = 'ERROR';
        return;
    }

    if (!val) val = '0';
    const dec = parseInt(val, base);

    if (base == 2) {
        bin_card.style.display = 'none';
    } else {
        bin_card.style.display = 'block';
        try {
            bin_out.textContent = dec.toString(2);
        } catch (e) {
            bin_out.textContent = 'Too Big ...';
        }
    }

    if (base === 8) {
        oct_card.style.display = 'none';
    } else {
        oct_card.style.display = 'block';
        try {
            oct_out.textContent = dec.toString(8);
        } catch (e) {
            oct_out.textContent = 'Too big ...';
        }
    }

    if (base === 10) {
        dec_card.style.display = 'none';
    } else {
        dec_card.style.display = 'block';
        try {
            dec_out.textContent = dec.toString(10);
        } catch (e) {
            dec_out.textContent = 'TOO BIG';
        }
    }

    if (base === 16) {
        hex_card.style.display = 'none';
    } else {
        hex_card.style.display = 'block';
        try {
            hex_out.textContent = dec.toString(16).toUpperCase();
        } catch (e) {
            hex_out.textContent = 'TOO BIG';
        }
    }
}

//uffffff endgame starts
messi.addEventListener('input', convertNumbers);
ronaldo.addEventListener('change', convertNumbers);

window.onload = function () {
    convertNumbers();
    messi.focus();
};
//done finally yay