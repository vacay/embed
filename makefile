deploy:
	grunt production
	aws s3 sync www/assets/ s3://embed.vacay.io/assets/
	aws s3 cp www/index.html s3://embed.vacay.io/index.html
