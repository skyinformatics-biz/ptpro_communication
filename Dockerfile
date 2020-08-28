FROM imagestry.cloudinfo.biz:5000/devenv
LABEL Elias Dev

COPY ./ /www/modules/communication

EXPOSE 4800

WORKDIR /
ENTRYPOINT ["bash", "/bin/init/exec.sh" ]
