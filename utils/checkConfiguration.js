/**
 * Function validating the configuration passed to a strategy, this shall be called in the constructor of each
 * startegy when the configuration is passed.
 */

const checkConfiguration = (configuration, mainSchema, startegySchema) => {
  if (!configuration.subConf) {
    throw new Error('mainConf Section missing');
  }
  const validateMainConf = mainSchema.validate(configuration, { errors: { wrap: { label: false, array: false } } });
  if (validateMainConf.error) throw new Error(validateMainConf.error);
  const validateSubConf = startegySchema.validate(configuration.subConf, { errors: { wrap: { label: false } } });
  if (validateSubConf.error) throw new Error(validateSubConf.error);
};

exports.checkConfiguration = checkConfiguration;
