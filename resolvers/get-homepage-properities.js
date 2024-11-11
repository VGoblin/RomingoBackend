const pg = require('../db/postgres/postgres.js');

async function getHomepageProperties(parent, args) {
	try {
		const properties = await pg.getHomepageProperties()
		console.log(properties.rows.length)
		return properties.rows.map(property => {

			property.featuredImageURL = `${
			  global.config.imageBaseURL
			}${encodeURIComponent(
			  property.imageDirectoryName
			)}/${encodeURIComponent(property.featuredImageFilename)}`;

			property.imageURLs = [];

			property.imageURLs.push(
			  `${
			    global.config.imageBaseURL
			  }${encodeURIComponent(
			property.imageDirectoryName
			  )}/${encodeURIComponent(property.featuredImageFilename)}`
			)

			for (let k = 0; k < property.imageFilenames.length; k++) {
			  property.imageURLs.push(
			    `${global.config.imageBaseURL}${encodeURIComponent(
			      property.imageDirectoryName
			    )}/${encodeURIComponent(property.imageFilenames[k])}`
			  );
			}

			return {
				...property,
				petFeePolicy: property.petFeesData,
			}
		})
	} catch (err) {
		console.log(err)
		return []
	}
}
async function getHomepagePropertiesTwo(parent, args) {
	try {
		const properties = await pg.getHomepagePropertiesTwo()
		console.log(properties.rows.length)
		return properties.rows.map(property => {

			property.featuredImageURL = `${
			  global.config.imageBaseURL
			}${encodeURIComponent(
			  property.imageDirectoryName
			)}/${encodeURIComponent(property.featuredImageFilename)}`;

			property.imageURLs = [];

			property.imageURLs.push(
			  `${
			    global.config.imageBaseURL
			  }${encodeURIComponent(
			property.imageDirectoryName
			  )}/${encodeURIComponent(property.featuredImageFilename)}`
			)

			for (let k = 0; k < property.imageFilenames.length; k++) {
			  property.imageURLs.push(
			    `${global.config.imageBaseURL}${encodeURIComponent(
			      property.imageDirectoryName
			    )}/${encodeURIComponent(property.imageFilenames[k])}`
			  );
			}

			return {
				...property,
				petFeePolicy: property.petFeesData,
			}
		})
	} catch (err) {
		console.log(err)
		return []
	}
}

async function getHomepagePropertiesThree(parent, args) {
	try {
		const properties = await pg.getHomepagePropertiesThree()
		console.log(properties.rows.length)
		return properties.rows.map(property => {

			property.featuredImageURL = `${
			  global.config.imageBaseURL
			}${encodeURIComponent(
			  property.imageDirectoryName
			)}/${encodeURIComponent(property.featuredImageFilename)}`;

			property.imageURLs = [];

			property.imageURLs.push(
			  `${
			    global.config.imageBaseURL
			  }${encodeURIComponent(
			property.imageDirectoryName
			  )}/${encodeURIComponent(property.featuredImageFilename)}`
			)

			for (let k = 0; k < property.imageFilenames.length; k++) {
			  property.imageURLs.push(
			    `${global.config.imageBaseURL}${encodeURIComponent(
			      property.imageDirectoryName
			    )}/${encodeURIComponent(property.imageFilenames[k])}`
			  );
			}

			return {
				...property,
				petFeePolicy: property.petFeesData,
			}
		})
	} catch (err) {
		console.log(err)
		return []
	}
}


module.exports = {
	getHomepageProperties,
	getHomepagePropertiesTwo,
	getHomepagePropertiesThree
}