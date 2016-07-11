s3cmd sync s3://logs.sitecues.com/raw/wsprd/V2/wsprd3.sitecues.com/tomcat/ --skip-existing --exclude site*.log.gz --exclude ivona* --exclude *.txt.gz --exclude catalina* ../data/
