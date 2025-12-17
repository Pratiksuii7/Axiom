 // ahh need to finish then zzzzzzz
 const coolPi = 3.14159; //lol
        const inputArea = document.getElementById('stuff-go-here');
        const answerSpot = document.getElementById('the-magic-number');

        function changeStuff() {
            const shape = document.getElementById('shape-picker').value;
            const type = document.getElementById('math-mode').value;
            
            answerSpot.innerText = '--';
            inputArea.innerHTML = '';

            if (!shape || !type) {
                inputArea.innerHTML = '<p id="read-me-first">Select a shape and calculation type above.</p>';
                return;
            }

            const is3d = shape === 'sphere' || shape === 'cube' || shape === 'cuboid';
            const is2d = shape === 'square' || shape === 'circle' || shape === 'triangle';
            
            if (type === 'volume' && is2d) {
                inputArea.innerHTML = '<p style="color:red;">Volume only works with 3D shapes!</p>';
                return;
            }
            if (type === 'perimeter' && is3d) {
                inputArea.innerHTML = '<p style="color:red;">3D shapes don\'t have perimeter!</p>';
                return;
            }
            if (type === 'area' && shape === 'cuboid') {
                inputArea.innerHTML = '<p style="color:red;">For cuboid, use volume calculation.</p>';
                return;
            }
            
            let html = '';
            
            if (shape === 'square' || shape === 'circle' || shape === 'cube') {
                html = '<label for="n1">Side/Radius:</label><input type="text" id="n1" placeholder="Enter value">';
            } else if (shape === 'sphere') {
                html = '<label for="n1">Radius:</label><input type="text" id="n1" placeholder="Enter radius">';
            } else if (shape === 'cuboid') {
                html = '<label for="n1">Length:</label><input type="text" id="n1" placeholder="Enter length">';
                html += '<label for="n2">Width:</label><input type="text" id="n2" placeholder="Enter width">';
                html += '<label for="n3">Height:</label><input type="text" id="n3" placeholder="Enter height">';
            } else if (shape === 'triangle') {
                if (type === 'area') {
                    html = '<label for="n1">Base:</label><input type="text" id="n1" placeholder="Enter base">';
                    html += '<label for="n2">Height:</label><input type="text" id="n2" placeholder="Enter height">';
                } else if (type === 'perimeter') {
                    html = '<label for="n1">Side A:</label><input type="text" id="n1" placeholder="Enter side A">';
                    html += '<label for="n2">Side B:</label><input type="text" id="n2" placeholder="Enter side B">';
                    html += '<label for="n3">Side C:</label><input type="text" id="n3" placeholder="Enter side C">';
                }
            }

            inputArea.innerHTML = html;
        }

        function doTheMath() {
            const shape = document.getElementById('shape-picker').value;
            const type = document.getElementById('math-mode').value;
            let res = 0;
            
            try {
                if (shape === 'square') {
                    const s = parseFloat(document.getElementById('n1').value);
                    if (isNaN(s)) throw new Error("Please enter a valid number!");
                    
                    if (type === 'area') res = s * s;
                    else if (type === 'perimeter') res = 4 * s;

                } else if (shape === 'circle') {
                    const r = parseFloat(document.getElementById('n1').value);
                    if (isNaN(r)) throw new Error("Please enter a valid number!");
                    
                    if (type === 'area') res = coolPi * r * r;
                    else if (type === 'perimeter') res = 2 * coolPi * r;

                } else if (shape === 'cube') {
                    const s = parseFloat(document.getElementById('n1').value);
                    if (isNaN(s)) throw new Error("Please enter a valid number!");
                    
                    if (type === 'area') res = 6 * s * s;
                    else if (type === 'volume') res = s * s * s;

                } else if (shape === 'cuboid') {
                    const l = parseFloat(document.getElementById('n1').value);
                    const w = parseFloat(document.getElementById('n2').value);
                    const h = parseFloat(document.getElementById('n3').value);
                    if (isNaN(l) || isNaN(w) || isNaN(h)) throw new Error("Please enter all three values!");
                    
                    if (type === 'volume') res = l * w * h;

                } else if (shape === 'triangle') {
                    if (type === 'area') {
                        const b = parseFloat(document.getElementById('n1').value);
                        const h = parseFloat(document.getElementById('n2').value);
                        if (isNaN(b) || isNaN(h)) throw new Error("Please enter both values!");
                        res = 0.5 * b * h;
                    } else if (type === 'perimeter') {
                        const a = parseFloat(document.getElementById('n1').value);
                        const b = parseFloat(document.getElementById('n2').value);
                        const c = parseFloat(document.getElementById('n3').value);
                        if (isNaN(a) || isNaN(b) || isNaN(c)) throw new Error("Please enter all three sides!");
                        res = a + b + c;
                    }

                } else if (shape === 'sphere') {
                    const r = parseFloat(document.getElementById('n1').value);
                    if (isNaN(r)) throw new Error("Please enter a valid number!");

                    if (type === 'area') res = 4 * coolPi * r * r;
                    else if (type === 'volume') res = (4 / 3) * coolPi * r * r * r;
                }

                answerSpot.innerText = res.toFixed(3);
                
            } catch (e) {
                answerSpot.innerText = e.message;
            }
        }
        changeStuff();