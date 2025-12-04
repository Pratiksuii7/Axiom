function update_band_color(band_id, color_name) {
            const graphic_element = document.getElementById(band_id);
            const prefix = 'bg-color-';
            graphic_element.className = graphic_element.className.split(' ').filter(c => !c.startsWith(prefix)).join(' ');
            graphic_element.classList.add(prefix + color_name);
        }

        function format_resistance(ohms) {
            if (ohms >= 1000000) {
                return (ohms / 1000000).toFixed(2).replace(/\.00$/, '') + " M\u03A9";
            }
            if (ohms >= 1000) {
                return (ohms / 1000).toFixed(2).replace(/\.00$/, '') + " k\u03A9";
            }
            return ohms.toFixed(2).replace(/\.00$/, '') + " \u03A9";
        }

        function calculate_resistance() {
            const band1_select = document.getElementById('band1');
            const band2_select = document.getElementById('band2');
            const multiplier_select = document.getElementById('multiplier');
            const tolerance_select = document.getElementById('tolerance');

            const value1 = parseInt(band1_select.value);
            const value2 = parseInt(band2_select.value);
            const multiplier_value = parseFloat(multiplier_select.value);
            const tolerance_value = parseFloat(tolerance_select.value);

update_band_color('band1_graphic', band1_select.options[band1_select.selectedIndex].getAttribute('data-color'));
update_band_color('band2_graphic', band2_select.options[band2_select.selectedIndex].getAttribute('data-color'));
update_band_color('band3_graphic', multiplier_select.options[multiplier_select.selectedIndex].getAttribute('data-color'));
update_band_color('band4_graphic', tolerance_select.options[tolerance_select.selectedIndex].getAttribute('data-color'));

            const resistance = (value1 * 10 + value2) * multiplier_value;
            const tolerance_percent = tolerance_value * 100;

            const min_resistance = resistance * (1 - tolerance_value);
            const max_resistance = resistance * (1 + tolerance_value);

            const resultbox = document.getElementById('resultbox');
            const minmax = document.getElementById('minmax');

            resultbox.innerHTML = `${format_resistance(resistance)} &pm; ${tolerance_percent.toFixed(2).replace(/\.00$/, '')}%`;
            minmax.innerHTML = `(Min: ${format_resistance(min_resistance)} | Max: ${format_resistance(max_resistance)})`;
        }

        document.addEventListener('DOMContentLoaded', calculate_resistance);