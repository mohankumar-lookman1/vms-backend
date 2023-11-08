    pipeline {
        agent any

        stages {
            stage('Checkout') {
                steps {
              git branch: 'main', credentialsId: '8f0692da-1268-474f-b0b1-cd0fc657aa9d', url: 'https://github.com/mohankumar-lookman1/vms-backend.git'
                }
            }

            stage('Build') {
                steps {
                    sh 'docker build -t mohankumar135/secura-vms:lts .'
                }
            }
            stage('Stop and Remove Previous Container') {   
                steps {
                        // Stop and remove the existing container named 'secura-vms-container'
                        sh 'docker stop secura-vms || true'
                        sh 'docker rm secura-vms || true'
                    
                }
            }
            stage('push') {
            steps{
                   
                        sh "docker login -u mohankumar135 -p @Yamaharx100"
                        sh 'docker push mohankumar135/secura-vms:lts'
                        
            }   
            }
            stage('deploy'){
                steps{
                  sshagent(credentials: ['devServer'], ignoreMissing: true) {
                    sh "docker login -u mohankumar135 -p @Yamaharx100"
                    sh 'docker pull mohankumar135/secura-vms:lts'
                    sh 'docker run -d  --network host -p 3000:3000 --name secura-vms mohankumar135/secura-vms:lts'
                }
                    
                }
            }
            
            
        }
    }
    