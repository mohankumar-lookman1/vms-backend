pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                sh 'docker build -t secura/secura-vms .'
            }
        }
        stage('Stop and Remove Previous Container') {
            steps {
                script {
                    // Stop and remove the existing container named 'secura-vms-container'
                    sh 'docker stop secura-vms-container || true'
                    sh 'docker rm secura-vms-container || true'
                }
            }
        }
        stage('Push and Run New Container') {
            
                    sh 'docker run -d --network host -p 3000:3000 --name secura-vms-container secura/secura-vms'
            
        }
    }
}
