 
        if (!localStorage.getItem('analysisHistory')) {
            localStorage.setItem('analysisHistory', JSON.stringify([]));
        }

        let videoStream = null;
        let chart = null;
        let analysisData = {
            timestamps: [],
            happiness: [],
            neutrality: [],
            attention: []
        };

        
        window.onload = () => {
            const timeline = gsap.timeline();
            
            timeline.to('.intro-text', {
                opacity: 1,
                duration: 1,
                ease: "power2.inOut"
            })
            .to('.intro-text', {
                opacity: 0,
                y: -50,
                delay: 1,
                duration: 0.5
            })
            .to('#intro-animation', {
                opacity: 0,
                duration: 0.5,
                onComplete: () => {
                    document.getElementById('intro-animation').style.display = 'none';
                    document.getElementById('main-content').style.opacity = 1;
                    initializeChart();
                    loadHistory();
                }
            });
        };

        function initializeChart() {
            const ctx = document.getElementById('emotion-chart').getContext('2d');
            chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [
                        {
                            label: 'Happiness Level',
                            borderColor: '#FFD700',
                            data: []
                        },
                        {
                            label: 'Neutrality',
                            borderColor: '#98FB98',
                            data: []
                        },
                        {
                            label: 'Attention Level',
                            borderColor: '#4682B4',
                            data: []
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100
                        }
                    }
                }
            });
        }

        async function startEmotionAnalysis() {
            try {
                if (videoStream) {
                    videoStream.getTracks().forEach(track => track.stop());
                }
                
              
                analysisData = {
                    timestamps: [],
                    happiness: [],
                    neutrality: [],
                    attention: []
                };

                videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
                const videoElement = document.createElement('video');
                videoElement.srcObject = videoStream;
                videoElement.autoplay = true;
                
                const videoFeed = document.getElementById('video-feed');
                videoFeed.innerHTML = '';
                videoFeed.appendChild(videoElement);
                
                const statusDiv = document.createElement('div');
                statusDiv.className = 'analysis-status';
                statusDiv.innerHTML = 'Analyzing emotional state...';
                videoFeed.appendChild(statusDiv);
                
               
                let analysisInterval = setInterval(() => {
                    const timestamp = new Date().toLocaleTimeString();
                    const happiness = Math.random() * 100;
                    const neutrality = Math.random() * 100;
                    const attention = Math.random() * 100;

                    analysisData.timestamps.push(timestamp);
                    analysisData.happiness.push(happiness);
                    analysisData.neutrality.push(neutrality);
                    analysisData.attention.push(attention);

                    updateChart();
                    updateMetrics(happiness, neutrality, attention);
                }, 1000);

                
                setTimeout(() => {
                    clearInterval(analysisInterval);
                    videoStream.getTracks().forEach(track => track.stop());
                    saveAnalysis();
                    videoFeed.innerHTML = '<div class="analysis-complete">Analysis Complete</div>';
                }, 10000);
                
            } catch (error) {
                console.error('Error accessing camera:', error);
                alert('Unable to access camera. Please ensure you have given camera permissions.');
            }
        }

        function updateChart() {
            chart.data.labels = analysisData.timestamps;
            chart.data.datasets[0].data = analysisData.happiness;
            chart.data.datasets[1].data = analysisData.neutrality;
            chart.data.datasets[2].data = analysisData.attention;
            chart.update();
        }

        function updateMetrics(happiness, neutrality, attention) {
            const metricsDiv = document.getElementById('analysis-metrics');
            metricsDiv.innerHTML = `
                <div class="metric-card">
                    <h3>Happiness</h3>
                    <p>${happiness.toFixed(1)}%</p>
                </div>
                <div class="metric-card">
                    <h3>Neutrality</h3>
                    <p>${neutrality.toFixed(1)}%</p>
                </div>
                <div class="metric-card">
                    <h3>Attention</h3>
                    <p>${attention.toFixed(1)}%</p>
                </div>
            `;
        }

        function saveAnalysis() {
            const history = JSON.parse(localStorage.getItem('analysisHistory'));
            const averages = {
                happiness: average(analysisData.happiness),
                neutrality: average(analysisData.neutrality),
                attention: average(analysisData.attention),
                timestamp: new Date().toLocaleString(),
                data: analysisData
            };
            
            history.unshift(averages);
            localStorage.setItem('analysisHistory', JSON.stringify(history.slice(0, 10)));
            loadHistory();
        }

        function average(arr) {
            return arr.reduce((a, b) => a + b, 0) / arr.length;
        }

        function loadHistory() {
            const history = JSON.parse(localStorage.getItem('analysisHistory'));
            const historyList = document.getElementById('history-list');
            
            historyList.innerHTML = history.map(entry => `
                <div class="history-item">
                    <h3>Analysis from ${entry.timestamp}</h3>
                    <p>Average Happiness: ${entry.happiness.toFixed(1)}%</p>
                    <p>Average Neutrality: ${entry.neutrality.toFixed(1)}%</p>
                    <p>Average Attention: ${entry.attention.toFixed(1)}%</p>
                </div>
            `).join('');
        }