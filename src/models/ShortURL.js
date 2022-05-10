module.exports = (sequelize, type) => {
	const ShortURL = sequelize.define('ShortURLs', {	
												shortCode: {
													type: type.STRING,			
													primaryKey: true
												},
												longURL: {
													type: type.STRING,
													allowNull: false
												},
												shortURL: {
													type: type.STRING,
													allowNull: false
												},
												clickCount: {
													type: type.INTEGER,		
													defaultValue: 0										
												}, 
												lastRequestedOn: {
													type: type.DATE
												}  
											});
	
	return ShortURL;
}