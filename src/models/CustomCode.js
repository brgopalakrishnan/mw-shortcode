module.exports = (sequelize, type) => {
	const CustomCode = sequelize.define('CustomCodes', {	
												customCode: {
													type: type.STRING,			
													primaryKey: true
												},
												shortCode: {
													type: type.STRING,
													allowNull: false,
													references: {
														model: "ShortURLs",
														key: "shortCode",
													},
        									onUpdate: "CASCADE",
													onDelete: "CASCADE",
												}    
											});	
	return CustomCode;
}