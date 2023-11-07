pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                sh 'docker build -t secura-vms .'
            }
        }
        stage('Deploy') {
            steps {
                sh 'docker run -d -p 8080:80 secura-vms'
            }
        }
    }
}