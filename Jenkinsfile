pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                sh 'docker build  secura-vms .'
            }
        }
        stage('Deploy') {
            steps {
                sh 'docker run -d  --network host -p 3000:3000 secura-vms'
            }
        }
    }
}