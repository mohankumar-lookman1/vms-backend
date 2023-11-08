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
                    // Stop and remove the existing container named 'secura-vms-container'
                    sh 'docker stop secura-vms-container || true'
                    sh 'docker rm secura-vms-container || true'
                
            }
        }
        stage('push') {
            // withCredentials([string(credentialsId:'docker-hub-pwd',variable:'dockerHubPwd')]) {
            //     sh "docker login -u mohankumar135 -p ${dockerHubPwd}"
            // }
            steps {
                sh 'docker run -d  --network host -p 3000:3000 secura-vms'
            }
        }
        
    }
}