//less js ayay  
  let mychart = null;

        function changetheme() {
            document.body.classList.toggle('darkmode');
        }

        function getrandomcolor() {
            const r = Math.floor(Math.random() * 255);
            const g = Math.floor(Math.random() * 255);
            const b = Math.floor(Math.random() * 255);
            return 'rgba(' + r + ',' + g + ',' + b + ', 0.6)';
        }

        function buildchart(type) {
            const ctx = document.getElementById('thecanvas');
            const strnames = document.getElementById('names').value;
            const strvals = document.getElementById('values').value;

            if (!strnames || !strvals) {
                alert('Please fill in both boxes');
                return;
            }

            const namelist = strnames.split(',');
            const vallist = strvals.split(',');
            
            const colorlist = [];
            for(let i = 0; i < vallist.length; i++) {
                colorlist.push(getrandomcolor());
            }

            if (mychart) {
                mychart.destroy();
            }

            Chart.defaults.color = document.body.classList.contains('darkmode') ? '#fff' : '#666';
            Chart.defaults.borderColor = document.body.classList.contains('darkmode') ? '#444' : '#ddd';

            mychart = new Chart(ctx, {
                type: type,
                data: {
                    labels: namelist,
                    datasets: [{
                        label: 'My Data',
                        data: vallist,
                        backgroundColor: colorlist,
                        borderColor: colorlist,
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        }
//this is the end brother