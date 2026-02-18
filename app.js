// ECG Arrhythmia Detector - Frontend Only Educational Demo

class ECGDetector {
    constructor() {
        this.canvas = document.getElementById('ecgCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.currentRhythm = 'normal';
        this.ecgData = [];
        this.rPeaks = [];
        this.rrIntervals = [];
        
        // Canvas setup
        this.setupCanvas();
        
        // Event listeners
        this.setupEventListeners();
        
        // Initial render
        this.generateECG('normal');
    }

    setupCanvas() {
        // Set canvas size based on container
        const container = this.canvas.parentElement;
        const dpr = window.devicePixelRatio || 1;
        const rect = container.getBoundingClientRect();
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = 300 * dpr;
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = '300px';
        
        this.ctx.scale(dpr, dpr);
        this.width = rect.width;
        this.height = 300;
    }

    setupEventListeners() {
        document.getElementById('normalBtn').addEventListener('click', () => {
            this.setRhythm('normal');
        });
        
        document.getElementById('afibBtn').addEventListener('click', () => {
            this.setRhythm('afib');
        });
        
        document.getElementById('missingPwaveBtn').addEventListener('click', () => {
            this.setRhythm('missingPwave');
        });

        window.addEventListener('resize', () => {
            this.setupCanvas();
            this.render();
        });
    }

    setRhythm(rhythm) {
        this.currentRhythm = rhythm;
        
        // Update button states
        document.querySelectorAll('.rhythm-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const btnMap = {
            'normal': 'normalBtn',
            'afib': 'afibBtn',
            'missingPwave': 'missingPwaveBtn'
        };
        
        document.getElementById(btnMap[rhythm]).classList.add('active');
        
        // Generate and analyze
        this.generateECG(rhythm);
        this.analyzeECG();
    }

    generateECG(rhythm) {
        const sampleRate = 250; // samples per second
        const duration = 10; // seconds
        const totalSamples = sampleRate * duration;
        this.ecgData = [];
        
        const baseline = this.height / 2;
        const amplitude = 80;
        
        for (let i = 0; i < totalSamples; i++) {
            const t = i / sampleRate;
            let value = 0;
            
            // Add baseline noise
            value += (Math.random() - 0.5) * 2;
            
            switch (rhythm) {
                case 'normal':
                    value += this.generateNormalBeat(t, sampleRate, amplitude);
                    break;
                case 'afib':
                    value += this.generateAFibBeat(t, sampleRate, amplitude);
                    break;
                case 'missingPwave':
                    value += this.generateMissingPWaveBeat(t, sampleRate, amplitude);
                    break;
            }
            
            this.ecgData.push(value);
        }
        
        this.render();
    }

    generateNormalBeat(t, sampleRate, amplitude) {
        // Normal sinus rhythm: regular intervals ~0.8-1.2 seconds
        const heartRate = 70; // bpm
        const beatInterval = 60 / heartRate;
        const beatPhase = (t % beatInterval) / beatInterval;
        
        if (beatPhase < 0.1) {
            // P-wave
            return Math.sin(beatPhase * Math.PI * 10) * amplitude * 0.15;
        } else if (beatPhase >= 0.1 && beatPhase < 0.2) {
            // PR segment (baseline)
            return 0;
        } else if (beatPhase >= 0.2 && beatPhase < 0.35) {
            // QRS complex
            const qrsPhase = (beatPhase - 0.2) / 0.15;
            return this.generateQRS(qrsPhase, amplitude);
        } else if (beatPhase >= 0.35 && beatPhase < 0.55) {
            // ST segment
            return 0;
        } else if (beatPhase >= 0.55 && beatPhase < 0.75) {
            // T-wave
            const tPhase = (beatPhase - 0.55) / 0.2;
            return Math.sin(tPhase * Math.PI) * amplitude * 0.3;
        }
        return 0;
    }

    generateAFibBeat(t, sampleRate, amplitude) {
        // Atrial fibrillation: irregular R-R intervals, no clear P-waves
        // Use variable intervals between 0.5-1.5 seconds
        const baseInterval = 0.8;
        const variability = 0.4;
        
        // Calculate which beat we're in
        let beatTime = 0;
        let beatIndex = 0;
        while (beatTime + baseInterval + Math.random() * variability < t) {
            beatTime += baseInterval + Math.random() * variability;
            beatIndex++;
        }
        
        const beatPhase = (t - beatTime) / (baseInterval + variability * 0.5);
        
        if (beatPhase < 0 || beatPhase > 1) return 0;
        
        // No clear P-wave (fibrillatory waves instead)
        if (beatPhase < 0.15) {
            // Fibrillatory baseline (irregular small waves)
            return (Math.random() - 0.5) * amplitude * 0.1;
        } else if (beatPhase >= 0.15 && beatPhase < 0.3) {
            // QRS complex
            const qrsPhase = (beatPhase - 0.15) / 0.15;
            return this.generateQRS(qrsPhase, amplitude);
        } else if (beatPhase >= 0.3 && beatPhase < 0.5) {
            // ST segment
            return 0;
        } else if (beatPhase >= 0.5 && beatPhase < 0.7) {
            // T-wave
            const tPhase = (beatPhase - 0.5) / 0.2;
            return Math.sin(tPhase * Math.PI) * amplitude * 0.3;
        }
        return 0;
    }

    generateMissingPWaveBeat(t, sampleRate, amplitude) {
        // Missing P-wave: regular intervals but no P-wave before QRS
        const heartRate = 75;
        const beatInterval = 60 / heartRate;
        const beatPhase = (t % beatInterval) / beatInterval;
        
        if (beatPhase < 0.15) {
            // No P-wave, just baseline
            return 0;
        } else if (beatPhase >= 0.15 && beatPhase < 0.3) {
            // QRS complex
            const qrsPhase = (beatPhase - 0.15) / 0.15;
            return this.generateQRS(qrsPhase, amplitude);
        } else if (beatPhase >= 0.3 && beatPhase < 0.5) {
            // ST segment
            return 0;
        } else if (beatPhase >= 0.5 && beatPhase < 0.7) {
            // T-wave
            const tPhase = (beatPhase - 0.5) / 0.2;
            return Math.sin(tPhase * Math.PI) * amplitude * 0.3;
        }
        return 0;
    }

    generateQRS(phase, amplitude) {
        // QRS complex: sharp spike
        if (phase < 0.2) {
            // Q wave (downward)
            return -Math.sin(phase * Math.PI * 2.5) * amplitude * 0.3;
        } else if (phase < 0.5) {
            // R wave (upward spike)
            return Math.sin((phase - 0.2) * Math.PI * 3.33) * amplitude;
        } else {
            // S wave (downward)
            return -Math.sin((phase - 0.5) * Math.PI * 2) * amplitude * 0.4;
        }
    }

    detectRPeaks() {
        this.rPeaks = [];
        const threshold = 50; // Minimum amplitude for R-peak
        const minDistance = 50; // Minimum samples between peaks
        
        for (let i = 1; i < this.ecgData.length - 1; i++) {
            // Look for local maxima above threshold
            if (this.ecgData[i] > threshold &&
                this.ecgData[i] > this.ecgData[i - 1] &&
                this.ecgData[i] > this.ecgData[i + 1]) {
                
                // Check minimum distance from previous peak
                if (this.rPeaks.length === 0 || 
                    (i - this.rPeaks[this.rPeaks.length - 1]) >= minDistance) {
                    this.rPeaks.push(i);
                }
            }
        }
        
        return this.rPeaks;
    }

    calculateRRIntervals() {
        this.rrIntervals = [];
        const sampleRate = 250; // samples per second
        
        for (let i = 1; i < this.rPeaks.length; i++) {
            const interval = (this.rPeaks[i] - this.rPeaks[i - 1]) / sampleRate;
            this.rrIntervals.push(interval);
        }
        
        return this.rrIntervals;
    }

    calculateVariability() {
        if (this.rrIntervals.length < 2) return 0;
        
        const mean = this.rrIntervals.reduce((a, b) => a + b, 0) / this.rrIntervals.length;
        const variance = this.rrIntervals.reduce((sum, val) => {
            return sum + Math.pow(val - mean, 2);
        }, 0) / this.rrIntervals.length;
        
        return Math.sqrt(variance);
    }

    detectPWave() {
        // Simplified P-wave detection: look for small positive deflection before QRS
        // In a real system, this would be more sophisticated
        const sampleRate = 250;
        const lookbackSamples = Math.floor(0.2 * sampleRate); // 200ms before R-peak
        
        let pWaveDetected = 0;
        let pWaveMissing = 0;
        
        for (let i = 1; i < this.rPeaks.length; i++) {
            const rPeakIndex = this.rPeaks[i];
            const pWaveStart = Math.max(0, rPeakIndex - lookbackSamples);
            const pWaveEnd = rPeakIndex - Math.floor(0.05 * sampleRate); // 50ms before R-peak
            
            // Look for positive deflection in P-wave region
            let maxPWave = 0;
            for (let j = pWaveStart; j < pWaveEnd; j++) {
                if (this.ecgData[j] > maxPWave) {
                    maxPWave = this.ecgData[j];
                }
            }
            
            // P-wave should be present if amplitude > 10 and < 30 (between noise and QRS)
            if (maxPWave > 10 && maxPWave < 30) {
                pWaveDetected++;
            } else {
                pWaveMissing++;
            }
        }
        
        return {
            detected: pWaveDetected,
            missing: pWaveMissing,
            present: pWaveDetected > pWaveMissing
        };
    }

    analyzeECG() {
        // Detect R-peaks
        this.detectRPeaks();
        
        // Calculate R-R intervals
        this.calculateRRIntervals();
        
        // Calculate variability
        const variability = this.calculateVariability();
        
        // Detect P-waves
        const pWaveResult = this.detectPWave();
        
        // Update metrics display
        this.updateMetrics(variability, pWaveResult);
        
        // Generate explainable output
        this.generateExplanation(variability, pWaveResult);
        
        // Re-render with highlights
        this.render();
    }

    updateMetrics(variability, pWaveResult) {
        const avgRR = this.rrIntervals.length > 0
            ? (this.rrIntervals.reduce((a, b) => a + b, 0) / this.rrIntervals.length).toFixed(3)
            : '-';
        
        document.getElementById('rPeakCount').textContent = this.rPeaks.length;
        document.getElementById('avgRRInterval').textContent = avgRR !== '-' ? avgRR + ' s' : '-';
        document.getElementById('rrVariability').textContent = variability.toFixed(3) + ' s';
        document.getElementById('pWaveStatus').textContent = pWaveResult.present ? 'Yes' : 'No';
    }

    generateExplanation(variability, pWaveResult) {
        const outputDiv = document.getElementById('analysisOutput');
        outputDiv.innerHTML = '';
        
        const explanation = document.createElement('div');
        explanation.className = 'explanation';
        
        let analysisText = '<strong>Analysis Steps:</strong><br><br>';
        
        // Step 1: R-peak detection
        analysisText += `1. <strong>R-Peak Detection:</strong> Detected ${this.rPeaks.length} R-peaks in the ECG signal.<br>`;
        
        // Step 2: R-R interval analysis
        if (this.rrIntervals.length > 0) {
            const avgRR = this.rrIntervals.reduce((a, b) => a + b, 0) / this.rrIntervals.length;
            analysisText += `2. <strong>R-R Interval Analysis:</strong> Average R-R interval is ${avgRR.toFixed(3)} seconds `;
            analysisText += `(${(60/avgRR).toFixed(0)} bpm).<br>`;
            
            // Variability assessment
            analysisText += `3. <strong>R-R Variability:</strong> Standard deviation of R-R intervals is ${variability.toFixed(3)} seconds. `;
            if (variability < 0.05) {
                analysisText += 'This indicates <strong>regular R-R intervals</strong>.<br>';
            } else {
                analysisText += 'This indicates <strong>irregular R-R intervals</strong>.<br>';
            }
        }
        
        // Step 3: P-wave analysis
        analysisText += `4. <strong>P-Wave Analysis:</strong> `;
        if (pWaveResult.present) {
            analysisText += `P-waves are <strong>present</strong> before QRS complexes (${pWaveResult.detected} detected, ${pWaveResult.missing} missing).<br>`;
        } else {
            analysisText += `P-waves are <strong>missing or not clearly visible</strong> (${pWaveResult.detected} detected, ${pWaveResult.missing} missing).<br>`;
        }
        
        // Conclusion
        const conclusion = document.createElement('div');
        conclusion.className = 'conclusion';
        
        let conclusionText = '<strong>Conclusion:</strong> ';
        
        if (variability < 0.05 && pWaveResult.present) {
            conclusionText += 'Regular R-R intervals and presence of P-waves → <strong>Normal Sinus Rhythm</strong>.';
        } else if (variability >= 0.05 && !pWaveResult.present) {
            conclusionText += 'Irregular R-R intervals and missing P-waves → <strong>Possible Atrial Fibrillation</strong>.';
        } else if (variability < 0.05 && !pWaveResult.present) {
            conclusionText += 'Regular R-R intervals but missing P-waves → <strong>Possible Junctional Rhythm or Missing P-Wave Scenario</strong>.';
        } else {
            conclusionText += 'Irregular R-R intervals detected. Further analysis recommended.';
        }
        
        explanation.innerHTML = analysisText;
        conclusion.innerHTML = conclusionText;
        
        outputDiv.appendChild(explanation);
        outputDiv.appendChild(conclusion);
    }

    render() {
        // Clear canvas
        this.ctx.fillStyle = '#0f0f1e';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw grid
        this.drawGrid();
        
        // Draw ECG waveform
        this.drawECGWaveform();
        
        // Highlight R-peaks
        this.highlightRPeaks();
    }

    drawGrid() {
        this.ctx.strokeStyle = '#1a1a3e';
        this.ctx.lineWidth = 1;
        
        // Vertical lines (time markers)
        for (let x = 0; x < this.width; x += this.width / 10) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
        }
        
        // Horizontal lines (voltage markers)
        for (let y = 0; y < this.height; y += this.height / 5) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
        }
    }

    drawECGWaveform() {
        if (this.ecgData.length === 0) return;
        
        this.ctx.strokeStyle = '#00ff88';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        
        const baseline = this.height / 2;
        const samplesPerPixel = this.ecgData.length / this.width;
        
        for (let x = 0; x < this.width; x++) {
            const sampleIndex = Math.floor(x * samplesPerPixel);
            if (sampleIndex < this.ecgData.length) {
                const y = baseline - this.ecgData[sampleIndex];
                if (x === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            }
        }
        
        this.ctx.stroke();
    }

    highlightRPeaks() {
        if (this.rPeaks.length === 0) return;
        
        const baseline = this.height / 2;
        const samplesPerPixel = this.ecgData.length / this.width;
        
        this.ctx.fillStyle = '#ff4444';
        this.ctx.strokeStyle = '#ff4444';
        this.ctx.lineWidth = 2;
        
        this.rPeaks.forEach(peakIndex => {
            const x = (peakIndex / this.ecgData.length) * this.width;
            const y = baseline - this.ecgData[peakIndex];
            
            // Draw circle at R-peak
            this.ctx.beginPath();
            this.ctx.arc(x, y, 4, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Draw vertical line
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ECGDetector();
});
