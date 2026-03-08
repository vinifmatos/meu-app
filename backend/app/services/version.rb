module Version
  def major
    ENV.fetch("APP_MAJOR_VERSION", 0).to_i
  end

  def minor
    ENV.fetch("APP_MINOR_VERSION", 1).to_i
  end

  def patch
    ENV.fetch("APP_PATCH_VERSION", 0).to_i
  end

  def to_s
    "v#{major}.#{minor}.#{patch}"
  end

  def api_version
    "v#{major}"
  end

  module_function :major, :minor, :patch, :to_s, :api_version
end
