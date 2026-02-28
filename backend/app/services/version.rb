module Version
  def major
    0
  end

  def minor
    1
  end

  def patch
    0
  end

  def to_s
    "v#{major}.#{minor}.#{patch}"
  end

  def api_version
    "v#{major}"
  end

  module_function :major, :minor, :patch, :to_s, :api_version
end
