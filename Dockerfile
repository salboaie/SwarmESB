FROM  centos:centos7
RUN yum install -y epel-release
RUN  yum install -y nodejs
RUN   yum install -y npm
RUN   yum install -y redis
COPY . /SwarmESB
RUN cd /SwarmESB; npm install; npm dedupe
RUN npm install http-server -g
EXPOSE  8000 8080
CMD ["/bin/bash", "/SwarmESB/container/start.sh"]









